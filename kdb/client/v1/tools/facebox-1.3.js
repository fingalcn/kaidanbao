/*
 * Facebox (for jQuery)
 * version: 1.3
 * @requires jQuery v1.2 or later
 * @homepage https://github.com/defunkt/facebox
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright Forever Chris Wanstrath, Kyle Neath
 *
 */
(function($) {
  $.facebox = function(data, klass) {
    $.facebox.loading(data.settings || []);

    if (klass) $('#facebox .content').addClass(klass);
    $('#facebox .content').empty().append(data);
    $('#facebox .popup').children().fadeIn('normal');
    var left = $(window).width() / 2 - ($('#facebox .popup').outerWidth() / 2);
    $('#facebox').css('left', left>0?left:0);
  }

  /** Public, $.facebox methods */
  $.extend($.facebox, {
    settings: {
      opacity      : 0.5,
      overlay      : true,
      title        : '信息',
      loadingImage : '/facebox/loading.gif',
      closeImage   : '/facebox/closelabel.png',
      imageTypes   : [ 'png', 'jpg', 'jpeg', 'gif' ],
      faceboxHtml  : '\
    <div id="facebox" style="display:none;"> \
      <div class="popup"> \
    	<div class="title"></div> \
        <div class="content"></div> \
	    <div class="footer"></div> \
        <span class="close"></span> \
      </div> \
    </div>'
    },
    loading: function() {
      init();
      if ($('#facebox .loading').length == 1) return true;
      showOverlay();

      $('#facebox .content').empty().append('<div class="loading"></div>');
      $('#facebox').show().css({
		 top: getPageScroll()[1] + (getPageHeight() / 16),
		 left: $(window).width() / 2 - ($('#facebox .popup').outerWidth() / 2)
      });
//      $(document).on('keydown.facebox', function(e) {
//        if(e.keyCode == 27) $.facebox.close();
//        return true;
//      });
    },
    close: function() {
    	$('#facebox').css('display','none');
//    	$('#facebox').fadeOut(function() {
    	      $('#facebox .content').removeClass().addClass('content');
    	      $('#facebox .loading').remove();
    	      $(document).trigger('afterClose.facebox');
//    	    });
	    hideOverlay();
        $('#facebox .footer').html('');
        return false;
    	}
  });

  /** Private methods */
  // called one time to setup facebox on this page
  function init(settings) {
    if ($.facebox.settings.inited) return true;
    else $.facebox.settings.inited = true;

    if (settings) $.extend($.facebox.settings, settings);
    $('body').append($.facebox.settings.faceboxHtml);

    $('#facebox .title').html($.facebox.settings.title);
    $('#facebox .close').click($.facebox.close).append('<svg aria-hidden="true" class="octicon octicon-x" height="29" width="29" role="img" version="1.1" viewBox="0 0 12 16"><path d="M7.48 8l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75-1.48-1.48 3.75-3.75L0.77 4.25l1.48-1.48 3.75 3.75 3.75-3.75 1.48 1.48-3.75 3.75z"></path></svg>');
  }

  // getPageScroll() by quirksmode.com
  function getPageScroll() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
      yScroll = self.pageYOffset;
      xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer
																						// 6
																						// Strict
      yScroll = document.documentElement.scrollTop;
      xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
      yScroll = document.body.scrollTop;
      xScroll = document.body.scrollLeft;
    }
    return new Array(xScroll,yScroll);
  }

  // Adapted from getPageSize() by quirksmode.com
  function getPageHeight() {
    var windowHeight;
    if (self.innerHeight) {	// all except Explorer
      windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer
																					// 6
																					// Strict
																					// Mode
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
      windowHeight = document.body.clientHeight;
    }
    return windowHeight;
  }

  function skipOverlay() {
    return $.facebox.settings.overlay == false || $.facebox.settings.opacity === null;
  }

  function showOverlay() {
    if (skipOverlay()) return;

    if ($('#facebox_overlay').length == 0)
      $("body").append('<div id="facebox_overlay" class="facebox_hide"></div>');
      // TODO not fadeIn when overlay click -> x by fingal
// $('#facebox_overlay').hide().addClass("facebox_overlayBG")
    $('#facebox_overlay').addClass("facebox_overlayBG").css('opacity', $.facebox.settings.opacity);
//      .click(function() { $(document).trigger('close.facebox') });
// .fadeIn(200);
    return false
  }

  function hideOverlay() {
    if (skipOverlay()) return;
  // TODO not fadeOut when overlay click -> x by fingal
// $('#facebox_overlay').fadeOut(200, function(){
// $("#facebox_overlay").removeClass("facebox_overlayBG");
// $("#facebox_overlay").addClass("facebox_hide");
    $("#facebox_overlay").remove();
// })
    return false;
  }
})(jQuery);
