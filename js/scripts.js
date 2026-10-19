$(document).ready(function () {
    var memoriesApiBaseUrl = (window.KH_MEMORIES_API_BASE_URL || '').replace(/\/$/, '');
    var guestAccessStorageKey = 'khMemoriesGuestName';
    var currentGuestName = '';

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'})[character];
        });
    }

    function unlockSite(name) {
        currentGuestName = $.trim(name || '');
        if (name) {
            try {
                window.sessionStorage.setItem(guestAccessStorageKey, name);
            } catch (error) {
                // The guest can still use the site when session storage is unavailable.
            }
        }

        $('body').removeClass('guest-access-pending');
        $('#guest-access-gate').addClass('is-unlocked').attr('aria-hidden', 'true');
    }

    function restoreGuestAccess() {
        var guestName = '';

        try {
            guestName = window.sessionStorage.getItem(guestAccessStorageKey) || '';
        } catch (error) {
            guestName = '';
        }

        if (guestName) {
            unlockSite(guestName);
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
            var preview = item.media_kind === 'video'
                ? '<video src="' + escapeHtml(mediaUrl) + '" controls preload="metadata" playsinline></video>'
                : '<a href="' + escapeHtml(mediaUrl) + '" target="_blank" rel="noopener"><img src="' + escapeHtml(mediaUrl) + '" alt="Wedding memory" loading="lazy"></a>';
            var hoverPreview = item.media_kind === 'video'
                ? ''
                : '<span class="gallery-hover-preview" aria-hidden="true"><img src="' + escapeHtml(mediaUrl) + '" alt=""></span>';

            return '<figure class="gallery-card">' +
                preview +
                '<a class="gallery-download" href="' + escapeHtml(downloadUrl) + '" download="' + escapeHtml(filename) + '" aria-label="Download ' + escapeHtml(filename) + '">' +
                '<i class="fa fa-download" aria-hidden="true"></i></a>' +
                hoverPreview +
                '</figure>';
        }).join(''));
    }

    function loadGallery() {
        if (!memoriesApiBaseUrl) {
            $('#gallery-status').text('The gallery is unavailable right now.');
            return;
        }

        $.ajax({
            url: memoriesApiBaseUrl + '/api/wedding/public/gallery',
            method: 'GET',
            cache: false
        }).done(function (data) {
            renderGallery((data && data.media) || []);
        }).fail(function () {
            $('#gallery-status').text('We could not load the gallery right now. Please try again later.');
        });
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

        $.ajax({
            url: memoriesApiBaseUrl + '/api/wedding/public/photos',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false
        }).done(function (data) {
            var count = (data && data.count) || files.length;
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
    window.setInterval(loadGallery, 30000);
    $(document).on('visibilitychange', function () {
        if (!document.hidden) {
            loadGallery();
        }
    });
    restoreGuestAccess();
});
