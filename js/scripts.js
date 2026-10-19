$(document).ready(function () {
    var memoriesApiBaseUrl = (window.KH_MEMORIES_API_BASE_URL || '').replace(/\/$/, '');
    var guestAccessStorageKey = 'khMemoriesGuestName';

    function unlockSite(name) {
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
        $('#photo-share-submit').prop('disabled', false).text('Upload Photos');
    });

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
            status.removeClass('is-success').addClass('is-error').text('Please upload 10 photos or fewer at a time.');
            return;
        }

        var formData = new FormData();
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
            status.removeClass('is-error').addClass('is-success').text('Thank you! Uploaded ' + count + ' photo' + (count === 1 ? '' : 's') + '.');
            $('#photo-share-form')[0].reset();
        }).fail(function (xhr) {
            var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'Memory upload failed. Please try again.';
            status.removeClass('is-success').addClass('is-error').text(detail);
        }).always(function () {
            $('#photo-share-submit').prop('disabled', false).text('Upload Photos');
        });
    });

    restoreGuestAccess();
});
