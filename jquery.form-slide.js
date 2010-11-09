//#####################################################
//## Formslide                                       ##
//#####################################################
//## usage:                                          ##
//##                                                 ##
//##   // use on the form you wish to slide, with    ##
//##   // a div for each 'step'.Note that you can    ##
//##   // only have on per page.                     ##
//##                                                 ##
//##   jqueryCollection.formslide(optionHash);       ##
//##                                                 ##
//## methods:                                        ##
//##                                                 ##
//##   // navigate, omitting the number of steps     ##
//##   // param will move one step                   ##
//##   $(selector).formslide.next(3);                ##
//##                                                 ##
//##   $(selector).formslide.previous(3);            ##
//##                                                 ##
//##   // param is the 1 based index of the form     ##
//##   // you want to slide to.                      ##
//##   $(selector).formslide.slideTo(3);             ##
//##                                                 ##
//##   // jumpTo is the same, just without animation ##
//##   $(selector).formslide.jumpTo(3);              ##
//##                                                 ##
//## options:                                        ##
//##                                                 ##
//##     width: <number or string>                   ##
//##                                                 ##
//##   if no width is passed in, a liquid            ##
//##   layout is assumed, and some addition          ##
//##   javascript will watch for window resizes.     ##
//##   if you want formslide not to touch the        ##
//##   width, and you don't need things to be        ##
//##   liquid, pass in width: 'fixed'                ##
//##                                                 ##
//## events:                                         ##
//##   formslide:initialize                          ##
//##   formslide:afterSlide                          ##
//##   formslide:beforeSlide                         ##
//##      second arg to beforeSlide is an object     ##
//##      which has a property called go. setting    ##
//##      this to false will cancel the slide. it    ##
//##      also has 1 based integer values of         ##
//##      commingFrom and goingTo. Finally, it has   ##
//##      a source property that is essentially      ##
//##      $(e.target);                               ##
//##                                                 ##
//#####################################################


(function($) {
  // stuff I don't want to pass around everywhere
  var _s; // settings
  var _v; // values
  var _f; // formslide form container

  $.fn.formslide = function(params) {
    initialize($(this), params);
    return this;
  }

  $.fn.formslide.next = next;
  $.fn.formslide.previous = previous;
  $.fn.formslide.slideTo = slideTo;
  $.fn.formslide.jumpTo = jumpTo;

  function initialize(elm, params) {
    settings(params);
    viewport(elm);
    values();
    styles();
    bind();

    go();
  }

  // methods

  function settings(params) {
    _s = $.extend({
      width: 'liquid' 
    }, params || {});

    if (parseInt(_s.width)) _f.width(_s.width)
  }

  function values() {
    _v = {};
    _v.paddingLeft = parseInt(_f.css('padding-left'))
    _v.paddingRight = parseInt(_f.css('padding-right'))
    _v.padding = _v.paddingLeft + _v.paddingRight

    _v.step = _f.innerWidth() + scrollbarWidth();
    _v.width = _v.step - _v.padding;

    _v.count = _f.find('.formslide div').size();
    // margin-left + step width makes things 1 based
    _v.current = ((parseInt(_f.children('.formslide').css('margin-left')) + _v.step) / _v.step)
  }

  function viewport(elm) {
    _f = elm.
      children().
        wrapAll("<div class='formslide'></div>").end().
      addClass('formslide-viewport').
      css('overflow', 'hidden');

    if (parseInt(_s.width)) {
      _f.width(_s.width);
    } 
  }

  function styles() {
    _f.find('.formslide div').
        width(_v.width).
        css('margin-right', _v.padding).
        css('float', 'left').end().
      find('.formslide').
        width(_v.step * _v.count);
  }

  function bind() {
    if (_s.width == 'liquid') {
      $(window).resize(function() {
        // need to go back to the old current
        var ind = _v.current;
        values();
        styles();
        jumpTo(ind);
      });
    }
  }


  // events

  function pre(target) {
    var source = _f.find('.formslide div:eq(' + (_v.current - 1) + ')');
    var args = {go: true, goingTo:target, comingFrom:_v.current, source: source};

    source.trigger('formslide:beforeSlide', args);

    return args;
  }

  function post(target) {
    _f.find('.formslide div:eq(' + (target - 1) + ')').trigger('formslide:afterSlide');
  }

  function go() {
    _f.show();
    $(window).trigger('formslide:initialize')
  }

  // handlers

  function next(count) {
    if (!count) count = 1;
    var target = _v.current + count;

    if ((target <= _v.count) && pre(target).go) {
      // current margin - (amount of steps * step size)
      var margin = (currentMargin() - stepWidth(count)) + "px"
      $('.formslide').stop().animate({marginLeft: margin});
      _v.current = _v.current + count;
      post(_v.current);
    }
  }

  function previous(count) {
    if (!count) count = 1;
    var target = _v.current - count;

    if ((target >= 1) && pre(target).go) {
      // current margin + (amount of steps * step size)
      var margin = (currentMargin() + stepWidth(count)) + "px"
      $('.formslide').stop().animate({marginLeft: margin});
      _v.current = _v.current - count;
      post(_v.current);
    }
  }

  function slideTo(ind) {
    if (validIndex(ind) && pre(ind).go) {
      var margin = stepWidth(ind - 1);
      $('.formslide').stop().animate({marginLeft: -margin});
      _v.current = ind
      post(_v.current);
    }
  }

  function jumpTo(ind) {
    if (validIndex(ind) && pre(ind).go) {
      var margin = stepWidth(ind - 1);
      $('.formslide').stop().css({marginLeft: -margin});
      _v.current = ind
      post(_v.current);
    }
  }

  // helpers

  function scrollbarWidth() {
    document.body.style.overflow = 'hidden';
    var width = document.body.clientWidth;
    document.body.style.overflow = 'scroll';
    width -= document.body.clientWidth;
    if(!width) width = document.body.offsetWidth-document.body.clientWidth;
    document.body.style.overflow = '';
    return width;
  }

  function currentMargin() {
    return parseInt($('.formslide').css('marginLeft'));
  }

  function validIndex(ind) {
    return ind > 0 && ind <= _v.count
  }

  function stepWidth(count) {
    return count * _v.step 
  }

})(jQuery);
