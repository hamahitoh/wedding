$(document).ready(function () {
    var memoriesApiBaseUrl = (window.KH_MEMORIES_API_BASE_URL || '').replace(/\/$/, '');
    var guestAccessStorageKey = 'khMemoriesGuestName';
    var guestAccessDurationMs = 30 * 60 * 1000;
    var currentGuestName = '';
    var mobileShareFiles = {};
    var mobileSharePromises = {};
    var galleryRefreshTimer = null;
    var galleryFingerprint = null;
    var galleryRequestInFlight = false;

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'})[character];
        });
    }

    function isMobileShareDevice() {
        var mobileUserAgent = /Android|iPad|iPhone|iPod|Mobile|Tablet/i.test(navigator.userAgent);
        var touchTablet = navigator.maxTouchPoints > 1 &&
            window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        return mobileUserAgent || touchTablet;
    }

    function isAppleMobileDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function prepareMobileShareFile(mediaUrl, filename, contentType, onProgress) {
        if (mobileShareFiles[mediaUrl]) {
            if (onProgress) {
                onProgress(100);
            }
            return Promise.resolve(mobileShareFiles[mediaUrl]);
        }
        if (mobileSharePromises[mediaUrl]) {
            return mobileSharePromises[mediaUrl];
        }

        mobileSharePromises[mediaUrl] = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', mediaUrl, true);
            xhr.responseType = 'blob';
            xhr.onprogress = function (progressEvent) {
                if (onProgress && progressEvent.lengthComputable && progressEvent.total > 0) {
                    onProgress(Math.min(100, Math.round((progressEvent.loaded / progressEvent.total) * 100)));
                }
            };
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) {
                    reject(new Error('Download failed'));
                    return;
                }
                var blob = xhr.response;
                if (!blob || !blob.size) {
                    reject(new Error('The media file was empty'));
                    return;
                }
                var file = new File([blob], filename, {type: blob.type || contentType});
                mobileShareFiles[mediaUrl] = file;
                if (onProgress) {
                    onProgress(100);
                }
                delete mobileSharePromises[mediaUrl];
                resolve(file);
            };
            xhr.onerror = function () {
                reject(new Error('Download failed'));
            };
            xhr.onabort = function () {
                reject(new Error('Download canceled'));
            };
            xhr.send();
        }).catch(function (error) {
            delete mobileSharePromises[mediaUrl];
            throw error;
        });

        return mobileSharePromises[mediaUrl];
    }

    function saveGuestAccess(name) {
        var access = JSON.stringify({
            name: name,
            expiresAt: Date.now() + guestAccessDurationMs
        });
        try {
            window.localStorage.setItem(guestAccessStorageKey, access);
        } catch (error) {
            // Session storage still provides a fallback when local storage is unavailable.
        }
        try {
            window.sessionStorage.setItem(guestAccessStorageKey, access);
        } catch (error) {
            // The guest can still use the current page when browser storage is unavailable.
        }
    }

    function clearGuestAccess() {
        try {
            window.localStorage.removeItem(guestAccessStorageKey);
        } catch (error) {
            // Ignore unavailable local storage.
        }
        try {
            window.sessionStorage.removeItem(guestAccessStorageKey);
        } catch (error) {
            // Ignore unavailable session storage.
        }
    }

    function storedGuestAccess() {
        var stored = '';
        try {
            stored = window.localStorage.getItem(guestAccessStorageKey) || '';
        } catch (error) {
            stored = '';
        }
        if (!stored) {
            try {
                stored = window.sessionStorage.getItem(guestAccessStorageKey) || '';
            } catch (error) {
                stored = '';
            }
        }
        if (!stored) {
            return null;
        }

        try {
            var access = JSON.parse(stored);
            if (!access.name || Number(access.expiresAt || 0) <= Date.now()) {
                clearGuestAccess();
                return null;
            }
            return access;
        } catch (error) {
            // Migrate the previous session-only name format into a 30-minute access record.
            return {name: stored, expiresAt: Date.now() + guestAccessDurationMs};
        }
    }

    function unlockSite(name, rememberAccess) {
        currentGuestName = $.trim(name || '');
        if (currentGuestName && rememberAccess !== false) {
            saveGuestAccess(currentGuestName);
        }

        $('body').removeClass('guest-access-pending');
        $('#guest-access-gate').addClass('is-unlocked').attr('aria-hidden', 'true');
    }

    function restoreGuestAccess() {
        var access = storedGuestAccess();
        if (access && access.name) {
            saveGuestAccess(access.name);
            unlockSite(access.name, false);
            return;
        }

        window.setTimeout(function () {
            $('#guest-access-name').focus();
        }, 50);
    }

    $('#guest-access-form').on('submit', function (event) {
        event.preventDefault();

        var guestName = $.trim($('#guest-access-name').val() || '');
        if (!guestName) {
            $('#guest-access-results').html('<div class="guest-access-message">Enter your full name to continue.</div>');
            $('#guest-access-name').focus();
            return;
        }

        unlockSite(guestName);
    });

    $('.nav-toggle').on('click', function (event) {
        event.preventDefault();
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
    });

    $('.header-nav li a').on('click', function () {
        $('.nav-toggle').removeClass('active');
        $('.header-nav').removeClass('open');
    });

    $(window).on('scroll', function () {
        var scrolled = $(window).scrollTop() >= 20;

        $('section.navigation').toggleClass('fixed', scrolled);
        $('header').css({
            'border-bottom': scrolled ? 'none' : 'solid 1px rgba(255, 255, 255, 0.2)',
            'padding': scrolled ? '35px 0' : '50px 0'
        });
        $('header .member-actions').css('top', scrolled ? '26px' : '41px');
        $('header .navicon').css('top', scrolled ? '34px' : '48px');
    });

    $('a[href*="#"]:not([href="#"])').on('click', function () {
        if ($(this).data('toggle') === 'modal') {
            return true;
        }

        if (location.pathname.replace(/^\//, '') !== this.pathname.replace(/^\//, '') || location.hostname !== this.hostname) {
            return true;
        }

        var target = $(this.hash);
        target = target.length ? target : $('[name="' + this.hash.slice(1) + '"]');
        if (target.length) {
            $('html, body').animate({scrollTop: target.offset().top - 90}, 1000);
            return false;
        }
    });

    $('#photo-share-modal').on('show.bs.modal', function () {
        $('#photo-share-form')[0].reset();
        $('#photo-share-status').removeClass('is-success is-error').text('');
        $('#photo-share-submit').prop('disabled', false).text('Upload Memories');
        $('#photo-upload-progress').attr('hidden', true).find('.transfer-progress-fill').css('width', '0%');
        $('#photo-upload-progress .transfer-progress-label').text('0% uploaded');
        $('#photo-share-greeting').text('Hi ' + (currentGuestName || 'there') + '! Thanks for your contribution!');
    });

    function renderGallery(media) {
        var gallery = $('#gallery-grid');
        var status = $('#gallery-status');

        if (!media.length) {
            status.text('');
            gallery.html('<div class="gallery-empty">Our gallery is being curated. Check back soon for shared memories.</div>');
            return;
        }

        status.text(media.length + ' memor' + (media.length === 1 ? 'y' : 'ies') + ' in the gallery');
        gallery.html(media.map(function (item) {
            var mediaUrl = memoriesApiBaseUrl + (item.url || '');
            var downloadUrl = memoriesApiBaseUrl + (item.download_url || '');
            var filename = item.original_filename || item.filename || 'wedding-memory';
            var contentType = item.content_type || (item.media_kind === 'video' ? 'video/mp4' : 'image/jpeg');
            var posterUrl = item.poster_url ? memoriesApiBaseUrl + item.poster_url : '';
            var preview = item.media_kind === 'video'
                ? '<video src="' + escapeHtml(mediaUrl) + '" poster="' + escapeHtml(posterUrl) + '" controls preload="metadata" playsinline webkit-playsinline></video>'
                : '<a href="' + escapeHtml(mediaUrl) + '" target="_blank" rel="noopener"><img src="' + escapeHtml(mediaUrl) + '" alt="Wedding memory" loading="lazy"></a>';
            var hoverPreview = item.media_kind === 'video'
                ? ''
                : '<span class="gallery-hover-preview" aria-hidden="true"><img src="' + escapeHtml(mediaUrl) + '" alt=""></span>';

            return '<figure class="gallery-card">' +
                preview +
                '<a class="gallery-download" href="' + escapeHtml(downloadUrl) + '" download="' + escapeHtml(filename) + '" ' +
                'data-media-url="' + escapeHtml(mediaUrl) + '" data-filename="' + escapeHtml(filename) + '" data-content-type="' + escapeHtml(contentType) + '" ' +
                'aria-label="Save ' + escapeHtml(filename) + '" title="Save to your device">' +
                '<i class="fa fa-download" aria-hidden="true"></i></a>' +
                '<div class="gallery-transfer-progress" hidden>' +
                '<div class="transfer-progress-track"><span class="transfer-progress-fill"></span></div>' +
                '<span class="transfer-progress-label">0% downloaded</span></div>' +
                hoverPreview +
                '</figure>';
        }).join(''));
    }

    function galleryMediaFingerprint(media) {
        return JSON.stringify(media.map(function (item) {
            return [
                item.filename || '',
                item.url || '',
                item.download_url || '',
                item.media_kind || '',
                item.poster_url || '',
                Number(item.size || 0)
            ];
        }));
    }

    $(document).on('click', '.gallery-download', function (event) {
        if (typeof File === 'undefined' || typeof XMLHttpRequest === 'undefined') {
            return true;
        }

        event.preventDefault();
        var button = $(this);
        var nativeFileShare = isMobileShareDevice() && navigator.share;
        var icon = button.find('i');
        var progress = button.siblings('.gallery-transfer-progress');
        var mediaUrl = button.attr('data-media-url') || '';
        var filename = button.attr('data-filename') || 'wedding-memory';
        var contentType = button.attr('data-content-type') || 'application/octet-stream';
        var previousStatus = $('#gallery-status').text();
        var preparedFile = mobileShareFiles[mediaUrl];

        function updateDownloadProgress(percent, label) {
            var safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
            progress.removeAttr('hidden');
            progress.find('.transfer-progress-fill').css('width', safePercent + '%');
            progress.find('.transfer-progress-label').text(label || (safePercent + '% downloaded'));
        }

        function savePreparedFile(file) {
            var objectUrl = window.URL.createObjectURL(file);
            var downloadLink = document.createElement('a');
            downloadLink.href = objectUrl;
            downloadLink.download = file.name || filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            window.setTimeout(function () {
                window.URL.revokeObjectURL(objectUrl);
            }, 1000);
        }

        if (!preparedFile || !nativeFileShare) {
            button.addClass('is-preparing').attr('aria-busy', 'true');
            icon.attr('class', 'fa fa-spinner fa-spin');
            updateDownloadProgress(0, 'Starting download...');
            $('#gallery-status').text(nativeFileShare ? 'Preparing this memory for the native save sheet...' : 'Downloading this memory...');
            prepareMobileShareFile(mediaUrl, filename, contentType, function (percent) {
                updateDownloadProgress(percent, percent + '% downloaded');
            }).then(function (file) {
                    if (nativeFileShare) {
                        updateDownloadProgress(100, 'Ready to save');
                        $('#gallery-status').text('Ready—tap the download icon again, then choose Save Image or Save Video.');
                    } else {
                        savePreparedFile(file);
                        delete mobileShareFiles[mediaUrl];
                        updateDownloadProgress(100, 'Download complete');
                        $('#gallery-status').text(previousStatus);
                    }
                })
                .catch(function () {
                    progress.attr('hidden', true);
                    if (nativeFileShare && isAppleMobileDevice()) {
                        $('#gallery-status').text('The file could not be loaded. Please check your connection and try again.');
                    } else {
                        $('#gallery-status').text('Starting a direct download to your device...');
                        window.location.href = button.attr('href');
                    }
                })
                .then(function () {
                    button.removeClass('is-preparing').removeAttr('aria-busy');
                    icon.attr('class', 'fa fa-download');
                });
            return false;
        }

        progress.attr('hidden', true);
        var shareData = {files: [preparedFile]};
        var sharePromise;
        try {
            sharePromise = navigator.share(shareData);
        } catch (error) {
            $('#gallery-status').text('Could not open the native save sheet. Please try again.');
            return false;
        }

        sharePromise.then(function () {
            delete mobileShareFiles[mediaUrl];
            $('#gallery-status').text(previousStatus);
        }).catch(function (error) {
            if (error && error.name === 'AbortError') {
                $('#gallery-status').text(previousStatus);
            } else if (isAppleMobileDevice()) {
                $('#gallery-status').text('Could not open the Apple save sheet. Please tap the icon again.');
            } else {
                $('#gallery-status').text('Starting a direct download to your device...');
                window.location.href = button.attr('href');
            }
        });

        return false;
    });

    function loadGallery() {
        if (!memoriesApiBaseUrl) {
            $('#gallery-status').text('The gallery is unavailable right now.');
            return;
        }

        if (galleryRequestInFlight) {
            return;
        }
        galleryRequestInFlight = true;

        $.ajax({
            url: memoriesApiBaseUrl + '/api/wedding/public/gallery',
            method: 'GET',
            cache: false
        }).done(function (data) {
            var media = (data && data.media) || [];
            var nextFingerprint = galleryMediaFingerprint(media);
            if (nextFingerprint !== galleryFingerprint) {
                galleryFingerprint = nextFingerprint;
                renderGallery(media);
            }
        }).fail(function () {
            $('#gallery-status').text('We could not load the gallery right now. Please try again later.');
        }).always(function () {
            galleryRequestInFlight = false;
            scheduleGalleryRefresh();
        });
    }

    function scheduleGalleryRefresh() {
        if (galleryRefreshTimer !== null) {
            window.clearTimeout(galleryRefreshTimer);
        }
        galleryRefreshTimer = window.setTimeout(function () {
            galleryRefreshTimer = null;
            loadGallery();
        }, 30000);
    }

    $('#photo-share-form').on('submit', function (event) {
        event.preventDefault();

        var files = $('#photo-share-files')[0].files;
        var status = $('#photo-share-status');

        if (!memoriesApiBaseUrl) {
            status.removeClass('is-success').addClass('is-error').text('Memory uploads are not available right now.');
            return;
        }
        if (!files || !files.length) {
            status.removeClass('is-success').addClass('is-error').text('Please choose at least one photo.');
            return;
        }
        if (files.length > 10) {
            status.removeClass('is-success').addClass('is-error').text('Please upload 10 memories or fewer at a time.');
            return;
        }
        var totalBytes = 0;
        $.each(files, function (_index, file) {
            totalBytes += file.size || 0;
        });
        if (totalBytes > 90 * 1024 * 1024) {
            status.removeClass('is-success').addClass('is-error').text('Please keep each upload batch under 90 MB.');
            return;
        }

        var formData = new FormData();
        formData.append('uploader_name', currentGuestName || 'Unknown guest');
        $.each(files, function (_index, file) {
            formData.append('files', file);
        });

        $('#photo-share-submit').prop('disabled', true).text('Uploading...');
        status.removeClass('is-success is-error').text('Uploading memories...');
        var uploadProgress = $('#photo-upload-progress');
        uploadProgress.removeAttr('hidden');
        uploadProgress.find('.transfer-progress-fill').css('width', '0%');
        uploadProgress.find('.transfer-progress-label').text('0% uploaded');

        $.ajax({
            url: memoriesApiBaseUrl + '/api/wedding/public/photos',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function (progressEvent) {
                        if (!progressEvent.lengthComputable || progressEvent.total <= 0) {
                            return;
                        }
                        var percent = Math.min(100, Math.round((progressEvent.loaded / progressEvent.total) * 100));
                        uploadProgress.find('.transfer-progress-fill').css('width', percent + '%');
                        uploadProgress.find('.transfer-progress-label').text(
                            percent === 100 ? '100% uploaded — processing...' : percent + '% uploaded'
                        );
                    });
                }
                return xhr;
            }
        }).done(function (data) {
            var count = (data && data.count) || files.length;
            uploadProgress.find('.transfer-progress-fill').css('width', '100%');
            uploadProgress.find('.transfer-progress-label').text('Upload complete');
            status.removeClass('is-error').addClass('is-success').text('Thank you! Uploaded ' + count + ' memor' + (count === 1 ? 'y' : 'ies') + ' for review.');
            $('#photo-share-form')[0].reset();
        }).fail(function (xhr) {
            var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'Memory upload failed. Please try again.';
            status.removeClass('is-success').addClass('is-error').text(detail);
        }).always(function () {
            $('#photo-share-submit').prop('disabled', false).text('Upload Memories');
        });
    });

    loadGallery();
    $(document).on('visibilitychange', function () {
        if (!document.hidden) {
            scheduleGalleryRefresh();
        }
    });
    restoreGuestAccess();
});
