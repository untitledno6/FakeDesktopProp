$( function () {

    // Status Bar
    initStatusBar();

    // Inbox
    initInbox();

    // Icons
    initIcons();

});

// Icons
// =====
function initIcons () {

    $( '[data-icons]' )
        .toArray()
        .map( $ )
        .forEach( function ( $iconsEl ) {

            var iconsConfig = $iconsEl.data();

            $( '[data-icon]' )
                .toArray()
                .map( $ )
                .forEach( function ( $iconEl ) {

                    var config = $iconEl.data();

                    // Position
                    $iconEl.css( {
                        'right': config.x * iconsConfig.gridX,
                        'top': config.y * iconsConfig.gridY,
                    });

                    // Add image
                    var imgStr = W.domStr()
                                        .push( 'img' )
                                            .attr( 'src', config.url )
                                            .attr( 'width', iconsConfig.gridX )
                                        .pop()
                                        .render();

                    $iconEl.append( imgStr );

                    // Add text
                    var txtStr = W.domStr()
                                        .push( 'div' )
                                            .attr( 'class', 'icon-text' )
                                            .text( config.name )
                                            .attr( 'style', 'width:' + iconsConfig.gridX )
                                        .pop()
                                        .render();

                    $iconEl.append( txtStr );
                });

        }); 

}

// Inbox
// =====
function initInbox () {
    var inboxCount = 0;
    var $inboxCounter = $( '[data-inbox-counter]' );
    var $inboxList = $( '[data-inbox-list]' );
    // This is the 
    var outlookConfig = $( '[ data-outlook-config]' ).data();

    loadMessages( outlookConfig.messagesPath )
        .success( function ( messages ) {
            var next = makeLoopingIterator( messages );
            (function addMessage () {
                // Loop
                setTimeout( addMessage, W.randomBetween( outlookConfig.newMessageEveryMin, outlookConfig.newMessageEveryMax ) );

                // Add message
                ++inboxCount;
                $inboxCounter.text( inboxCount );
                var message = next();
                var item = makeEmailDom( message[0], message[1], message[2] );
                $inboxList.prepend( item );

                // Clear messages
                var maxMessages = Math.ceil( $inboxList.height() / 78 ) + 1;
                $inboxList.children().each( function ( i ) {
                    if ( i > maxMessages ) {
                        $(this).remove();
                    }
                }); 
            }());
        });
}

// Messages
// ========
function loadMessages( path ) {
    return W.promise( function ( resolve, reject ) { 
        $.ajax({
            url : path,
            dataType: 'text',
            success : function ( text ) {
                var messages = text.split( '\n' ).reduce( function ( acc, line ) {
                    if ( line === '' ) {
                        return acc;
                    }
                    acc.push( line.split( '|' ) );
                    return acc;
                }, [] );
                resolve( messages );
            }
        });

    });
}

function makeLoopingIterator ( arr ) {
    var idx = -1;
    return function () {
        if ( ++idx >=  arr.length ) {
            idx = 0;
        }
        return arr[ idx ];
    };
}

// Email
// =====

function makeEmailDom ( from, subject, message ) {
    var time = makeTime();
    return W.domStr()
        .push( 'div' ).attr( 'class', 'outlook-list-item' )
            .push( 'div' ).attr( 'class', 'unread' ).pop()
            .push( 'h1' ).text( from ).pop()
            .push( 'h2' ).text( subject ).pop()
            .push( 'h3' ).text( message ).pop()
            .push( 'h4' ).text( time.hour + ':' + time.min ).pop()
        .pop()  
        .render();
}



// Status Bar
// ==========

function initStatusBar () {

    // Render Taskbar time 
    // -------------------
    var $time = $( '[data-bar-time]' );
    var $date = $( '[data-bar-date]' );

    (function renderDateTime () {
        // Loop
        setTimeout( renderDateTime, 1000 );

        var time = makeTime();
        $time.text( time.hour12 + ':' + time.min + ' ' + time.ampm );
        $date.text( time.date + '/' + time.month + '/' + time.year );

    }());

}

// Utils
// =====

function makeTime () {
    var now = new Date();

    var hour = now.getHours();
    var min = now.getMinutes();
    if (min < 10) {
        min = '0' + min;
    }
    var ampm = hour < 12 ? 'AM' : 'PM';
    var hour12 = hour;
    if ( hour > 12 ) { 
        hour12 -= 12;
    }

    var date = now.getDate();
    var month = now.getMonth();
    var year = now.getFullYear();

    return {
        hour: hour,
        hour12: hour12,
        min: min,
        ampm: ampm,
        date: date,
        month: month,
        year: year
    }
}