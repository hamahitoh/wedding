$(document).ready(function () {
    var rsvpGoogleForm = {
        formResponseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeAc8AtLbRQH9iw3RLrk9bLJ_xtXkT7-vbwcxxDjc5zRKRHgw/formResponse',
        fields: {
            fullName: 'entry.851531526',
            attendance: 'entry.67388496',
            contact: 'entry.1373784535',
            partySize: 'entry.791242374',
            guestNames: 'entry.90835907',
            dietary: 'entry.520093493',
            song: 'entry.602395418',
            notes: 'entry.1429695988'
        }
    };
    var rsvpBackend = {
        apiBaseUrl: (window.KH_RSVP_API_BASE_URL || '').replace(/\/$/, '')
    };
    var rsvpState = {
        mode: rsvpBackend.apiBaseUrl ? 'api' : 'google',
        rsvpToken: '',
        household: null,
        publicContent: null
    };

    /***************** Waypoints ******************/

    $('.wp1').waypoint(function () {
        $('.wp1').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp2').waypoint(function () {
        $('.wp2').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp3').waypoint(function () {
        $('.wp3').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp4').waypoint(function () {
        $('.wp4').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp5').waypoint(function () {
        $('.wp5').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp6').waypoint(function () {
        $('.wp6').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });
    $('.wp7').waypoint(function () {
        $('.wp7').addClass('animated fadeInUp');
    }, {
        offset: '75%'
    });
    $('.wp8').waypoint(function () {
        $('.wp8').addClass('animated fadeInLeft');
    }, {
        offset: '75%'
    });
    $('.wp9').waypoint(function () {
        $('.wp9').addClass('animated fadeInRight');
    }, {
        offset: '75%'
    });

    /***************** Initiate Flexslider ******************/
    $('.flexslider').flexslider({
        animation: "slide"
    });

    /***************** Initiate Fancybox ******************/

    $('.single_image').fancybox({
        padding: 4
    });

    $('.fancybox').fancybox({
        padding: 4,
        width: 1000,
        height: 800
    });

    /***************** Tooltips ******************/
    $('[data-toggle="tooltip"]').tooltip();

    /***************** Nav Transformicon ******************/

    /* When user clicks the Icon */
    $('.nav-toggle').click(function () {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');

    });

    /***************** Header BG Scroll ******************/

    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({
                    "top": "26px",
                });
                $('header .navicon').css({
                    "top": "34px",
                });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({
                    "top": "41px",
                });
                $('header .navicon').css({
                    "top": "48px",
                });
            }
        });
    });
    /***************** Smooth Scrolling ******************/

    $(function () {

        $('a[href*=#]:not([href=#])').click(function () {
            if ($(this).data('toggle') === 'modal') {
                return true;
            }

            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });

    });

    /********************** Social Share buttons ***********************/
    $('.share-bar').hide();

    /********************** Embed youtube video *********************/
    $('.player').YTPlayer();


    /********************** Toggle Map Content **********************/
    $('#btn-show-map').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });
    $('#btn-show-content').click(function () {
        $('#map-content').toggleClass('toggle-map-content');
        $('#btn-show-content').toggleClass('toggle-map-content');
    });

    /********************** Add to Calendar **********************/
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            // Event title
            title: "Kate and Hamahito's Wedding",

            // Event start date
            start: new Date('Oct 17, 2026 16:00'),

            // Event duration (IN MINUTES)
            // duration: 120,

            // You can also choose to set an end time
            // If an end time is set, this will take precedence over duration
            end: new Date('Oct 17, 2026 22:00'),

            // Event Address
            address: 'Danza Del Sol Winery by Wedgewood Weddings, 39050 De Portola Road, Temecula, CA 92592',

            // Event Description
            description: "We can't wait to see you on our big day."
        }
    });

    $('#add-to-cal').html(myCalendar);


    /********************** RSVP **********************/
    function rsvpEscape(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            })[char];
        });
    }

    function rsvpEmailIsValid(value) {
        var email = $.trim(value || '');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function rsvpApi(path, payload) {
        return $.ajax({
            url: rsvpBackend.apiBaseUrl + path,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload || {})
        });
    }

    function addressHtml(value) {
        return rsvpEscape(value).replace(/,\s*/g, '<br>');
    }

    function paragraphHtml(value) {
        return rsvpEscape(value).replace(/\n/g, '<br>');
    }

    function safeImageUrl(value) {
        var url = $.trim(value || '');
        if (!url || url.indexOf('//') === 0) {
            return '';
        }
        if (url.indexOf(':') !== -1 && !/^https?:\/\//i.test(url)) {
            return '';
        }
        return url;
    }

    function safeLinkUrl(value) {
        var url = $.trim(value || '');
        if (!/^https?:\/\//i.test(url)) {
            return '';
        }
        return url;
    }

    function renderContentCards(rows) {
        return (rows || []).map(function (item) {
            var name = item.name || '';
            var description = item.description || '';
            var url = item.url || '';
            var imageUrl = safeImageUrl(item.image_url || '');
            var image = imageUrl
                ? '<img class="content-card-thumb" src="' + rsvpEscape(imageUrl) + '" alt="' + rsvpEscape(name) + ' thumbnail" loading="lazy">'
                : '';
            var title = url
                ? '<h5><a href="' + rsvpEscape(url) + '" target="_blank" rel="noopener">' + rsvpEscape(name) + '</a></h5>'
                : '<h5>' + rsvpEscape(name) + '</h5>';
            return '<div class="col-md-4">' + image + title + '<p>' + paragraphHtml(description) + '</p></div>';
        }).join('');
    }

    function renderScheduleItems(rows, column, includeHeader, headerText) {
        var items = (rows || []).filter(function (item) {
            if (column === 'all') {
                return true;
            }
            return (item.column || 'left') === column;
        });
        var html = includeHeader ? '<div><p><strong>' + rsvpEscape(headerText) + '</strong></p></div>' : '';
        html += items.map(function (item) {
            return '<div class="schedule-item">' +
                '<h5>' + rsvpEscape(item.title || '') + ' <span class="time">' + rsvpEscape(item.time || '') + '</span></h5>' +
                '<p>' + paragraphHtml(item.description || '') + '</p>' +
                '</div>';
        }).join('');
        return html;
    }

    function hydrateWebsiteContent(content) {
        rsvpState.publicContent = content || {};
        var event = (content && content.event_details) || {};
        var travel = (content && content.travel) || {};
        var date = event.date || 'Saturday, October 17, 2026';
        var locationSummary = event.location_summary || 'Temecula, California';
        var venueName = event.venue_name || 'Danza Del Sol Winery by Wedgewood Weddings';
        var venueAddress = event.venue_address || '39050 De Portola Road, Temecula, CA 92592';
        $('#site-event-summary').html('<span>' + rsvpEscape(date) + '</span><span>' + rsvpEscape(locationSummary) + '</span>');
        $('#site-invitation-summary').text('Join us on ' + date + ' at ' + venueName + ' in ' + locationSummary + '.');
        $('#site-schedule-right').html(renderScheduleItems(event.schedule || [], 'all', true, date));
        $('#site-dress-title').html(rsvpEscape(event.dress_code_title || 'Wedding') + ' <span class="time">' + rsvpEscape(event.dress_code_time || '') + '</span>');
        $('#site-dress-body').html(paragraphHtml(event.dress_code_body || 'Add dress code here. Include formality, shoe advice, outdoor/indoor notes, and expected weather.'));
        $('#site-hotels-intro').text(travel.hotels_intro || '');
        $('#site-hotels-grid').html(renderContentCards(travel.hotels || []));
        $('#site-things-intro').text(travel.things_intro || '').toggle(!!travel.things_intro);
        $('#site-things-grid').html(renderContentCards(travel.things_to_do || []));
        $('#site-venue-name').text(venueName);
        $('#site-venue-address').text(venueAddress);
        $('#site-travel-notes').html(paragraphHtml(event.travel_notes || ''));
        $('#site-directions-link').attr('href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(venueName + ' ' + venueAddress));
        renderRsvpCeremonySummary();
        renderTopRehearsalSummary();
    }

    function loadWebsiteContent() {
        if (!rsvpBackend.apiBaseUrl) {
            return;
        }
        $.ajax({
            url: rsvpBackend.apiBaseUrl + '/api/wedding/public/content',
            method: 'GET',
            cache: false
        }).done(function (data) {
            hydrateWebsiteContent(data.content || {});
        });
    }

    function resetPersonalizedRsvp() {
        rsvpState.rsvpToken = '';
        rsvpState.household = null;
        $('#rsvp-token').val('');
        $('#rsvp-household-panel').hide().empty();
        $('#rsvp-existing-response').hide().empty();
        $('#rsvp-rehearsal-summary').hide().empty();
        $('#rsvp-wedding-party-note').hide().empty();
        $('#rsvp-party-note').text('');
        $('#rsvp-party-size-wrap').show();
        $('#rsvp-bringing-guest-wrap').hide();
        $('#rsvp-bringing-guest-wrap input').prop('checked', false);
        $('#rsvp-invited-guests').empty();
        $('#rsvp-additional-guests').empty();
        $('#rsvp-plus-one').val('');
        $('#rsvp-form')[0].reset();
    }

    function renderAdditionalCountOptions(maxAdditionalGuests, currentValue) {
        var options = '';
        for (var i = 0; i <= maxAdditionalGuests; i += 1) {
            options += '<option value="' + i + '">' + i + '</option>';
        }
        $('#rsvp-additional-count').html(options);
        if (currentValue >= 0 && currentValue <= maxAdditionalGuests) {
            $('#rsvp-additional-count').val(String(currentValue));
        } else {
            $('#rsvp-additional-count').val('0');
        }
    }

    function householdMemberNames(household) {
        var members = (household && household.members) || [];
        var primaryCount = primaryGuestCount(household);
        if (members.length >= primaryCount) {
            return members.slice(0, primaryCount);
        }
        var rows = members.slice();
        if (!rows.length) {
            rows.push(household && household.display_name ? household.display_name : 'Guest');
        }
        while (rows.length < primaryCount) {
            rows.push('Guest ' + (rows.length + 1));
        }
        return rows;
    }

    function primaryGuestCount(household) {
        return Math.max(parseInt(household && household.primary_guest_count, 10) || 1, 1);
    }

    function childGuestCount(household) {
        return Math.max(parseInt(household && household.child_guest_count, 10) || 0, 0);
    }

    function effectiveMaxPartySize(household) {
        return primaryGuestCount(household) + childGuestCount(household) + (household && household.plus_one_allowed ? 1 : 0);
    }

    function usesSinglePlusOnePrompt(household) {
        return primaryGuestCount(household) <= 1 &&
            childGuestCount(household) === 0 &&
            !!(household && household.plus_one_allowed) &&
            effectiveMaxPartySize(household) <= 2;
    }

    function invitationDisplayName(household) {
        var displayName = $.trim((household && household.display_name) || '');
        if (!displayName) {
            displayName = householdMemberNames(household).join(' and ');
        }
        if (usesSinglePlusOnePrompt(household) && !/\bguest\b/i.test(displayName)) {
            displayName += ' and Guest';
        }
        return displayName || 'Your Invitation';
    }

    function setPartySizeValue(value) {
        var partySize = Math.max(parseInt(value, 10) || 0, 0);
        $('#rsvp-party-size').val(String(partySize));
    }

    function ceremonyDetailData() {
        var content = rsvpState.publicContent || {};
        var event = content.event_details || {};
        var ceremony = ((event.schedule || []).filter(function (item) {
            return /ceremony/i.test(item.title || '');
        })[0]) || {};
        return {
            date: event.date || 'Saturday, October 17, 2026',
            time: ceremony.time || '4:00 PM',
            venue: event.venue_name || 'Danza Del Sol Winery',
            address: event.venue_address || '39050 De Portola Road, Temecula, CA 92592'
        };
    }

    function ceremonyDetailMarkup() {
        var ceremony = ceremonyDetailData();
        return '<strong>Wedding Ceremony</strong>' +
            '<div>' + rsvpEscape(ceremony.date) + ' at ' + rsvpEscape(ceremony.time) + '</div>' +
            '<div>' + rsvpEscape(ceremony.venue) + '</div>' +
            '<div>' + rsvpEscape(ceremony.address) + '</div>';
    }

    function renderRsvpCeremonySummary() {
        $('#rsvp-ceremony-summary').html(ceremonyDetailMarkup()).show();
    }

    function rehearsalDinnerDetailMarkup() {
        var content = rsvpState.publicContent || {};
        var event = content.event_details || {};
        var rehearsal = event.rehearsal_dinner || {};
        var dateTime = [rehearsal.date, rehearsal.time].filter(Boolean).join(' at ');
        var venue = rehearsal.venue_name || '';
        var address = rehearsal.venue_address || '';
        var url = safeLinkUrl(rehearsal.url || '');
        if (!dateTime && !venue && !address) {
            return '';
        }
        var venueMarkup = url
            ? '<a href="' + rsvpEscape(url) + '" target="_blank" rel="noopener">' + rsvpEscape(venue || url) + '</a>'
            : rsvpEscape(venue);
        return '<strong>Rehearsal Dinner</strong>' +
            (dateTime ? '<div>' + rsvpEscape(dateTime) + '</div>' : '') +
            (venueMarkup ? '<div>' + venueMarkup + '</div>' : '') +
            (address ? '<div>' + rsvpEscape(address) + '</div>' : '');
    }

    function renderTopRehearsalSummary() {
        var household = rsvpState.household || {};
        var markup = rehearsalDinnerDetailMarkup();
        var hasAttendingGuest = attendingInvitedCount() > 0;
        if (household.invited_rehearsal_dinner && markup && hasAttendingGuest) {
            $('#rsvp-rehearsal-summary').html(markup).show();
        } else {
            $('#rsvp-rehearsal-summary').hide().empty();
        }
    }

    function eventOptionsMarkup(showRehearsal, visible, values) {
        values = values || {};
        return '<div class="rsvp-event-options' + (visible ? ' is-visible' : '') + '">' +
            '<div class="rsvp-event-options-title">Other events this person will attend</div>' +
            '<div class="rsvp-guest-options">' +
            (showRehearsal ? '<label><input class="rsvp-event-rehearsal" type="checkbox"' + (values.rehearsal_dinner ? ' checked' : '') + '>Rehearsal Dinner</label>' : '') +
            '<label><input class="rsvp-event-brunch" type="checkbox"' + (values.sunday_brunch ? ' checked' : '') + '>Sunday Brunch</label>' +
            '</div></div>';
    }

    function rowEventSelections(row, attending) {
        if (!attending) {
            return {
                rehearsal_dinner: false,
                sunday_brunch: false
            };
        }
        return {
            rehearsal_dinner: row.find('.rsvp-event-rehearsal').is(':checked'),
            sunday_brunch: row.find('.rsvp-event-brunch').is(':checked')
        };
    }

    function syncInvitedEventOptions() {
        $('#rsvp-invited-guests .rsvp-guest-row').each(function () {
            var row = $(this);
            var attending = row.find('input.rsvp-invited-attendance:checked').val() === 'Yes, I will attend';
            row.find('.rsvp-event-options').toggleClass('is-visible', attending);
            if (!attending) {
                row.find('.rsvp-event-options input').prop('checked', false);
            }
        });
        renderTopRehearsalSummary();
    }

    function collectInvitedGuestResponses() {
        var responses = [];
        $('#rsvp-invited-guests .rsvp-guest-row').each(function () {
            var row = $(this);
            var attendance = row.find('input.rsvp-invited-attendance:checked').val() || '';
            var attending = attendance === 'Yes, I will attend';
            var events = rowEventSelections(row, attending);
            responses.push({
                name: row.data('guestName') || '',
                attendance: attendance,
                age_three_or_under: false,
                rehearsal_dinner: events.rehearsal_dinner,
                sunday_brunch: events.sunday_brunch
            });
        });
        return responses;
    }

    function attendingInvitedCount() {
        return collectInvitedGuestResponses().filter(function (item) {
            return item.attendance === 'Yes, I will attend';
        }).length;
    }

    function renderInvitedGuestRows(members) {
        var household = rsvpState.household || {};
        var showRehearsal = !!household.invited_rehearsal_dinner;
        var rows = (members || []).map(function (name, index) {
            var radioName = 'invitedAttendance' + index;
            return '<div class="rsvp-guest-row" data-guest-name="' + rsvpEscape(name) + '">' +
                '<div class="rsvp-guest-row-name">' + rsvpEscape(name) + '</div>' +
                '<div class="rsvp-guest-options">' +
                '<label><input class="rsvp-invited-attendance" type="radio" name="' + radioName + '" value="Yes, I will attend" required>Yes, I will attend</label>' +
                '<label><input class="rsvp-invited-attendance" type="radio" name="' + radioName + '" value="No, I cannot attend" required>No, I cannot attend</label>' +
                '</div>' +
                eventOptionsMarkup(showRehearsal, false, {}) +
                '</div>';
        }).join('');
        $('#rsvp-invited-guests').html('<h4>Will You Be Attending The Reception?</h4>' + rows);
    }

    function responseDateLabel(value) {
        if (!value) {
            return '';
        }
        var date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'});
        }
        return value;
    }

    function splitResponseNames(value) {
        return String(value || '').split(/[;\n,]+/).map(function (part) {
            return $.trim(part);
        }).filter(Boolean);
    }

    function existingPersonRows(existing) {
        var invited = $.isArray(existing.invited_guest_responses) ? existing.invited_guest_responses : [];
        var additional = $.isArray(existing.additional_guest_responses) ? existing.additional_guest_responses : [];
        if (invited.length || additional.length) {
            return invited.concat(additional).map(function (person) {
                var events = [];
                if (person.rehearsal_dinner) {
                    events.push('Rehearsal Dinner');
                }
                if (person.sunday_brunch) {
                    events.push('Sunday Brunch');
                }
                if (person.age_three_or_under) {
                    events.push('3 years or younger');
                }
                return '<li><strong>' + rsvpEscape(person.name || 'Guest') + '</strong>: ' +
                    rsvpEscape(person.attendance || 'Yes, I will attend') +
                    (events.length ? '<span>' + rsvpEscape(events.join(' · ')) + '</span>' : '') +
                    '</li>';
            }).join('');
        }
        return splitResponseNames(existing.guest_names).map(function (name) {
            return '<li><strong>' + rsvpEscape(name) + '</strong>: ' + rsvpEscape(existing.attendance || 'Submitted') + '</li>';
        }).join('');
    }

    function existingListItem(label, value) {
        if (!value) {
            return '';
        }
        return '<li><strong>' + rsvpEscape(label) + '</strong><span>' + rsvpEscape(value) + '</span></li>';
    }

    function eventGuestSummary(names, fallback) {
        if ($.isArray(names) && names.length) {
            return 'Attending: ' + names.join('; ');
        }
        return fallback || 'No attendance recorded';
    }

    function renderExistingResponse(data) {
        var existing = data.existing_response || {};
        var household = data.household || {};
        var submitted = responseDateLabel(existing.submitted_at);
        var people = existingPersonRows(existing);
        var details = [
            existingListItem('Submitted', submitted),
            existingListItem('Contact email', existing.contact || ''),
            existingListItem('Overall response', existing.attendance || ''),
            existingListItem('Party size', existing.party_size || existing.party_size === 0 ? String(existing.party_size) : ''),
            existingListItem('Sunday brunch', eventGuestSummary(existing.sunday_brunch_guest_names, existing.sunday_brunch_attendance))
        ].join('');
        var optional = [
            existingListItem('Dietary restrictions or allergies', existing.dietary_restrictions || ''),
            existingListItem('Anything else we should know?', existing.notes || ''),
            existingListItem('Song request', existing.song_request || '')
        ].join('');
        var rehearsal = '';
        if (household.invited_rehearsal_dinner) {
            rehearsal = '<div class="rsvp-existing-section">' +
                '<h4>Rehearsal Dinner</h4>' +
                '<div class="rsvp-existing-event-detail">' + rehearsalDinnerDetailMarkup() + '</div>' +
                '<ul class="rsvp-existing-details">' +
                existingListItem('Your response', eventGuestSummary(existing.rehearsal_dinner_guest_names, existing.rehearsal_attendance)) +
                '</ul>' +
                '</div>';
        }
        return '<strong>Your RSVP is already on file.</strong>' +
            '<div class="rsvp-existing-copy">Here is the response we have for this invitation. If you would like to request any changes, please let us know and we will try to accommodate.</div>' +
            '<div class="rsvp-existing-section">' +
            '<h4>Response Summary</h4>' +
            '<ul class="rsvp-existing-details">' + details + '</ul>' +
            '</div>' +
            (people ? '<div class="rsvp-existing-section"><h4>Guest Responses</h4><ul class="rsvp-existing-people">' + people + '</ul></div>' : '') +
            rehearsal +
            (optional ? '<div class="rsvp-existing-section"><h4>Other Notes</h4><ul class="rsvp-existing-details">' + optional + '</ul></div>' : '') +
            '<div class="rsvp-existing-section rsvp-change-request-section">' +
            '<h4>Request a Change</h4>' +
            '<label for="rsvp-change-request-message" class="sr-only">Requested RSVP change</label>' +
            '<textarea id="rsvp-change-request-message" class="rsvp-change-request-input" rows="4" maxlength="2000" placeholder="Tell us what needs to be changed."></textarea>' +
            '<button class="btn-fill rsvp-change-request-submit" type="button">Send Change Request</button>' +
            '<div class="rsvp-change-request-status" role="status" aria-live="polite"></div>' +
            '</div>';
    }

    function setExistingResponseMode(enabled) {
        $('#rsvp-contact').closest('.row').toggle(!enabled);
        $('#rsvp-rehearsal-summary').toggle(!enabled && $('#rsvp-rehearsal-summary').html() !== '');
        $('#rsvp-invited-guests').toggle(!enabled);
        $('#rsvp-party-size-wrap').closest('.row').toggle(!enabled);
        $('#rsvp-bringing-guest-wrap').toggle(!enabled && $('#rsvp-bringing-guest-wrap').is(':visible'));
        $('#rsvp-additional-guests').toggle(!enabled);
        $('#rsvp-form details').toggle(!enabled);
        $('#rsvp-submit-button').toggle(!enabled);
    }

    function renderAdditionalGuestRows(count, showEmptyMessage, rowType) {
        var existing = [];
        if (showEmptyMessage === undefined) {
            showEmptyMessage = true;
        }
        rowType = rowType || 'additional';
        $('#rsvp-additional-guests .rsvp-additional-row').each(function () {
            existing.push({
                name: $(this).find('.rsvp-additional-name').val() || '',
                age_three_or_under: $(this).find('.rsvp-additional-age').is(':checked'),
                rehearsal_dinner: $(this).find('.rsvp-event-rehearsal').is(':checked'),
                sunday_brunch: $(this).find('.rsvp-event-brunch').is(':checked')
            });
        });
        if (count <= 0) {
            $('#rsvp-additional-guests').html(showEmptyMessage ? '<div class="rsvp-help-text rsvp-additional-empty">No additional guest names needed for this party size.</div>' : '');
            return;
        }
        var rows = '';
        var title = rowType === 'children' ? 'Will any children be attending?' : 'Guest information';
        var labelPrefix = rowType === 'children' ? 'Child' : 'Guest';
        var showAgeCheck = rowType === 'children';
        var showRehearsal = !!(rsvpState.household && rsvpState.household.invited_rehearsal_dinner);
        for (var i = 0; i < count; i += 1) {
            var values = existing[i] || {};
            rows += '<div class="rsvp-guest-row rsvp-additional-row">' +
                '<label for="rsvp-additional-name-' + i + '">' + labelPrefix + ' ' + (i + 1) + ' full name</label>' +
                '<input id="rsvp-additional-name-' + i + '" class="rsvp-additional-name" type="text" autocomplete="name" value="' + rsvpEscape(values.name || '') + '">' +
                (showAgeCheck ? '<label class="rsvp-age-check"><input class="rsvp-additional-age" type="checkbox"' + (values.age_three_or_under ? ' checked' : '') + '>3 Years or Younger?</label>' : '') +
                eventOptionsMarkup(showRehearsal, true, values) +
                '</div>';
        }
        $('#rsvp-additional-guests').html('<h4>' + title + '</h4>' + rows);
    }

    function syncPartySizeControls() {
        var household = rsvpState.household || {};
        var maxPartySize = effectiveMaxPartySize(household);
        var singlePlusOne = usesSinglePlusOnePrompt(household);
        var attendingCount = attendingInvitedCount();

        if (maxPartySize <= 1 || singlePlusOne) {
            $('#rsvp-party-size-wrap').hide();
            if (singlePlusOne && attendingCount > 0) {
                $('#rsvp-bringing-guest-wrap').show();
            } else {
                $('#rsvp-bringing-guest-wrap').hide();
                $('#rsvp-bringing-guest-wrap input').prop('checked', false);
            }

            var bringingGuest = $('#rsvp-bringing-guest-wrap input[name="bringingGuest"]:checked').val();
            var additionalGuestCount = singlePlusOne && attendingCount > 0 && bringingGuest === 'yes' ? 1 : 0;
            setPartySizeValue(attendingCount + additionalGuestCount);
            renderAdditionalGuestRows(additionalGuestCount, false, 'guest');
            syncInvitedEventOptions();
            return;
        }

        var maxAdditionalGuests = childGuestCount(household);
        if (maxAdditionalGuests <= 0) {
            $('#rsvp-party-size-wrap').hide();
            $('#rsvp-bringing-guest-wrap').hide();
            $('#rsvp-bringing-guest-wrap input').prop('checked', false);
            renderAdditionalCountOptions(0, 0);
            setPartySizeValue(attendingCount);
            renderAdditionalGuestRows(0, false, 'children');
            syncInvitedEventOptions();
            return;
        }

        $('#rsvp-party-size-wrap').show();
        $('#rsvp-bringing-guest-wrap').hide();
        $('#rsvp-bringing-guest-wrap input').prop('checked', false);
        var currentAdditionalCount = parseInt($('#rsvp-additional-count').val(), 10);
        renderAdditionalCountOptions(maxAdditionalGuests, currentAdditionalCount);
        var additionalGuestCount = parseInt($('#rsvp-additional-count').val(), 10) || 0;
        setPartySizeValue(attendingCount + additionalGuestCount);
        renderAdditionalGuestRows(additionalGuestCount, false, 'children');
        syncInvitedEventOptions();
    }

    function collectAdditionalGuestResponses() {
        var responses = [];
        $('#rsvp-additional-guests .rsvp-additional-row').each(function () {
            responses.push({
                name: $.trim($(this).find('.rsvp-additional-name').val() || ''),
                age_three_or_under: $(this).find('.rsvp-additional-age').is(':checked'),
                rehearsal_dinner: $(this).find('.rsvp-event-rehearsal').is(':checked'),
                sunday_brunch: $(this).find('.rsvp-event-brunch').is(':checked')
            });
        });
        return responses;
    }

    function updateLegacyGuestFields(invitedResponses, additionalResponses) {
        var attendingNames = invitedResponses.filter(function (item) {
            return item.attendance === 'Yes, I will attend';
        }).map(function (item) {
            return item.name;
        }).concat(additionalResponses.map(function (item) {
            return item.name;
        }).filter(Boolean));
        var additionalNames = additionalResponses.map(function (item) {
            return item.name;
        }).filter(Boolean);
        $('#rsvp-guests').val(attendingNames.join('; '));
        $('#rsvp-plus-one').val(additionalNames.join('; '));
        $('#rsvp-name').val((rsvpState.household && (rsvpState.household.members || [])[0]) || '');
    }

    function validateStructuredGuestResponses(invitedResponses, additionalResponses, partySize) {
        var missingInvited = invitedResponses.some(function (item) {
            return item.attendance !== 'Yes, I will attend' && item.attendance !== 'No, I cannot attend';
        });
        if (missingInvited) {
            return 'Choose yes or no for each guest on this invitation.';
        }
        var attendingCount = invitedResponses.filter(function (item) {
            return item.attendance === 'Yes, I will attend';
        }).length;
        if (partySize < attendingCount) {
            return 'Party size cannot be smaller than the number of invited guests attending.';
        }
        if (partySize === 0 && attendingCount > 0) {
            return 'Choose a party size for the attending guest(s).';
        }
        if (attendingCount === 0 && additionalResponses.length > 0) {
            return 'At least one named guest must attend before adding additional guests.';
        }
        if (usesSinglePlusOnePrompt(rsvpState.household || {}) && attendingCount > 0) {
            var bringingGuest = $('#rsvp-bringing-guest-wrap input[name="bringingGuest"]:checked').val();
            if (bringingGuest !== 'yes' && bringingGuest !== 'no') {
                return 'Choose whether you will be bringing a guest.';
            }
        }
        var expectedAdditional = Math.max(partySize - attendingCount, 0);
        if (additionalResponses.length !== expectedAdditional) {
            return 'The additional guest rows do not match the selected party size.';
        }
        var missingAdditional = additionalResponses.some(function (item) {
            return !item.name;
        });
        if (missingAdditional) {
            return 'Enter a full name for each additional guest.';
        }
        return '';
    }

    function renderHouseholdForm(data) {
        var household = data.household || {};
        rsvpState.rsvpToken = data.rsvp_token || '';
        rsvpState.household = household;
        $('#rsvp-token').val(rsvpState.rsvpToken);
        $('#rsvp-lookup-panel').hide();
        $('#rsvp-form').show();
        $('#rsvp-name').val((household.members && household.members[0]) || household.display_name || '');
        $('#rsvp-household-panel')
            .html('<div class="rsvp-invitation-name">' + rsvpEscape(invitationDisplayName(household)) + '</div>')
            .show();
        renderRsvpCeremonySummary();
        renderTopRehearsalSummary();
        renderInvitedGuestRows(householdMemberNames(household));
        renderAdditionalCountOptions(0, 0);
        renderAdditionalGuestRows(0, false);
        $('#rsvp-party-size-wrap').show();
        $('#rsvp-bringing-guest-wrap').hide();
        $('#rsvp-bringing-guest-wrap input').prop('checked', false);
        $('#rsvp-party-note').text('');
        if (household.wedding_party_notes) {
            $('#rsvp-wedding-party-note')
                .html('<strong>' + rsvpEscape(household.wedding_party_role || 'Wedding party') + '</strong><div>' + rsvpEscape(household.wedding_party_notes) + '</div>')
                .show();
        }
        if (data.already_received) {
            $('#rsvp-existing-response')
                .html(renderExistingResponse(data))
                .show();
            $('#rsvp-form :input').not('button, [data-dismiss], .rsvp-change-request-input').prop('disabled', true);
            $('#rsvp-submit-button').prop('disabled', true);
        } else {
            $('#rsvp-existing-response').hide().empty();
            $('#rsvp-form :input').prop('disabled', false);
            $('#rsvp-submit-button').prop('disabled', false);
        }
        syncPartySizeControls();
        setExistingResponseMode(!!data.already_received);
    }

    function renderMatches(matches) {
        var markup = matches.map(function (match) {
            return '<div class="rsvp-match-card">' +
                '<strong>' + rsvpEscape(match.display_name) + '</strong>' +
                '<button class="btn-fill rsvp-confirm-match" type="button" data-token="' + rsvpEscape(match.match_token) + '">Yes, this is me</button>' +
                '</div>';
        }).join('');
        $('#rsvp-match-results').html(markup || '<div class="rsvp-existing-response">We could not find a clear match. Please check the spelling or contact Kate or Hamahito.</div>');
    }

    function submitGoogleRsvp(form) {
        var missingBackend = !rsvpGoogleForm.formResponseUrl;
        Object.keys(rsvpGoogleForm.fields).forEach(function (fieldName) {
            if (!rsvpGoogleForm.fields[fieldName]) {
                missingBackend = true;
            }
        });

        if (missingBackend) {
            $('#alert-wrapper').html(alert_markup('info', '<strong>RSVP form not connected yet.</strong> Send us the published Google Form link so we can finish the connection.'));
            return;
        }

        var formData = new FormData(form);
        var googleForm = $('<form>', {
            action: rsvpGoogleForm.formResponseUrl,
            method: 'POST',
            target: 'rsvp-submit-frame'
        }).hide();

        Object.keys(rsvpGoogleForm.fields).forEach(function (fieldName) {
            $('<input>', {
                type: 'hidden',
                name: rsvpGoogleForm.fields[fieldName],
                value: formData.get(fieldName) || ''
            }).appendTo(googleForm);
        });

        $('body').append(googleForm);
        $('#rsvp-submit-button').prop('disabled', true).text('Submitting...');
        $('#alert-wrapper').html(alert_markup('info', '<strong>Submitting RSVP...</strong>'));
        googleForm.submit();

        window.setTimeout(function () {
            googleForm.remove();
            $('#rsvp-submit-button').prop('disabled', false).text('Submit RSVP');
            $('#alert-wrapper').html('');
            $('#rsvp-form')[0].reset();
            $('#rsvp-form-modal').modal('hide');
            window.setTimeout(function () {
                $('#rsvp-modal').modal('show');
            }, 350);
        }, 1200);
    }

    if (rsvpState.mode === 'api') {
        $('#rsvp-form').hide();
    } else {
        $('#rsvp-lookup-panel').hide();
    }

    renderRsvpCeremonySummary();
    loadWebsiteContent();

    $('#rsvp-form-modal').on('show.bs.modal', function () {
        if (rsvpState.mode === 'api') {
            resetPersonalizedRsvp();
            $('#rsvp-lookup-panel').show();
            $('#rsvp-form').hide();
            $('#rsvp-match-results').empty();
            $('#rsvp-lookup-name').val('');
        }
    });

    $('#rsvp-lookup-button').on('click', function () {
        var name = $('#rsvp-lookup-name').val();
        $('#rsvp-match-results').html('<div class="rsvp-help-text">Searching...</div>');
        rsvpApi('/api/wedding/public/lookup', {name: name})
            .done(function (data) {
                renderMatches(data.matches || []);
            })
            .fail(function (xhr) {
                var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'Search failed. Please try again.';
                $('#rsvp-match-results').html('<div class="rsvp-existing-response">' + rsvpEscape(detail) + '</div>');
            });
    });

    $('#rsvp-lookup-name').on('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            $('#rsvp-lookup-button').trigger('click');
        }
    });

    $('#rsvp-match-results').on('click', '.rsvp-confirm-match', function () {
        var token = $(this).data('token');
        $('#rsvp-match-results').html('<div class="rsvp-help-text">Loading your invitation...</div>');
        rsvpApi('/api/wedding/public/confirm', {match_token: token})
            .done(renderHouseholdForm)
            .fail(function (xhr) {
                var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'Confirmation failed. Please search again.';
                $('#rsvp-match-results').html('<div class="rsvp-existing-response">' + rsvpEscape(detail) + '</div>');
            });
    });

    $('#rsvp-existing-response').on('click', '.rsvp-change-request-submit', function () {
        var button = $(this);
        var panel = button.closest('.rsvp-change-request-section');
        var message = $.trim(panel.find('.rsvp-change-request-input').val() || '');
        var status = panel.find('.rsvp-change-request-status');
        if (message.length < 3) {
            status.removeClass('is-success').addClass('is-error').text('Please enter the change you would like to request.');
            panel.find('.rsvp-change-request-input').focus();
            return;
        }
        button.prop('disabled', true).text('Sending...');
        status.removeClass('is-error is-success').text('Sending your request...');
        rsvpApi('/api/wedding/public/change-request', {
            rsvp_token: rsvpState.rsvpToken,
            message: message
        }).done(function (data) {
            status.removeClass('is-error').addClass('is-success').text((data && data.message) || 'Your change request has been sent.');
            panel.find('.rsvp-change-request-input').val('');
        }).fail(function (xhr) {
            var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'Change request failed. Please try again.';
            status.removeClass('is-success').addClass('is-error').text(detail);
        }).always(function () {
            button.prop('disabled', false).text('Send Change Request');
        });
    });

    $('#rsvp-invited-guests').on('change', '.rsvp-invited-attendance', syncPartySizeControls);
    $('#rsvp-additional-count').on('change', syncPartySizeControls);
    $('#rsvp-bringing-guest-wrap').on('change', 'input[name="bringingGuest"]', syncPartySizeControls);

    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(this);
        var contact = $.trim(formData.get('contact') || '');
        if (!rsvpEmailIsValid(contact)) {
            $('#alert-wrapper').html(alert_markup('danger', '<strong>Please enter a valid email address.</strong>'));
            $('#rsvp-contact').focus();
            return;
        }

        var invitedResponses = collectInvitedGuestResponses();
        var additionalResponses = collectAdditionalGuestResponses();
        var partySize = parseInt(formData.get('partySize'), 10) || 0;
        var guestValidation = validateStructuredGuestResponses(invitedResponses, additionalResponses, partySize);
        if (guestValidation) {
            $('#alert-wrapper').html(alert_markup('danger', '<strong>' + rsvpEscape(guestValidation) + '</strong>'));
            return;
        }
        updateLegacyGuestFields(invitedResponses, additionalResponses);
        formData = new FormData(this);

        if (rsvpState.mode !== 'api') {
            submitGoogleRsvp(this);
            return;
        }

        $('#rsvp-submit-button').prop('disabled', true).text('Submitting...');
        $('#alert-wrapper').html(alert_markup('info', '<strong>Submitting RSVP...</strong>'));
        rsvpApi('/api/wedding/public/submit', {
            rsvp_token: rsvpState.rsvpToken,
            attendance: partySize > 0 ? 'Yes, I will attend' : 'No, I cannot attend',
            contact: formData.get('contact'),
            party_size: formData.get('partySize'),
            guest_names: formData.get('guestNames'),
            plus_one_name: formData.get('plusOneName'),
            invited_guest_responses: invitedResponses,
            additional_guest_responses: additionalResponses,
            dietary: formData.get('dietary'),
            song: formData.get('song'),
            notes: formData.get('notes')
        }).done(function () {
            $('#rsvp-submit-button').prop('disabled', false).text('Submit RSVP');
            $('#alert-wrapper').html('');
            $('#rsvp-form-modal').modal('hide');
            window.setTimeout(function () {
                $('#rsvp-modal').modal('show');
            }, 350);
        }).fail(function (xhr) {
            var detail = (xhr.responseJSON && xhr.responseJSON.detail) || 'RSVP failed. Please try again.';
            $('#rsvp-submit-button').prop('disabled', false).text('Submit RSVP');
            $('#alert-wrapper').html(alert_markup('danger', '<strong>' + rsvpEscape(detail) + '</strong>'));
        });
    });

});

/********************** Extras **********************/

// Google map
function initMap() {
    var location = {lat: 33.52965, lng: -117.014909};
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: location,
        scrollwheel: false
    });

    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

function initBBSRMap() {
    var la_fiesta = {lat: 20.305826, lng: 85.85480189999998};
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: la_fiesta,
        scrollwheel: false
    });

    var marker = new google.maps.Marker({
        position: la_fiesta,
        map: map
    });
}

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}

// MD5 Encoding
var MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return (x ^ y ^ z);
    }

    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    function WordToHex(lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
};
