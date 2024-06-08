/*!
 * jQuery UI Sortable Animation 0.0.1
 *
 * Copyright 2015, Egor Sharapov
 * Licensed under the MIT license.
 *
 * Depends:
 *  jquery.ui.sortable.js
 */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery", "jquery-ui"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  const supports = {};
  const testProp = (prefixes) => {
    const testEl = document.createElement("div");
    let i;
    const l = prefixes.length;

    for (i = 0; i < l; i++) {
      if (testEl.style[prefixes[i]] !== undefined) {
        return prefixes[i];
      }
    }

    return "";
  };
  let useCssAnimation = false;

  // check for css-transforms support
  supports.transform = testProp(["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"]);

  // check for css-transitions support
  supports.transition = testProp(["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"]);

  useCssAnimation = supports.transform && supports.transition;

  $.widget("ui.sortable", $.ui.sortable, {
    options: {
      // adds the new `animation` option, turned off by default.
      animation: 0,
    },

    // called internally by sortable when sortable
    // items are rearranged.
    // eslint-disable-next-line no-underscore-dangle, consistent-return
    _rearrange(e, item) {
      let $item;
      let props = {};
      const resetProps = {};
      let offset;
      const axis = $.trim(this.options.axis);

      // just call the original implementation of _rearrange()
      // if option `animation` is turned off
      // `currentContainer` used for animating received items
      // from another sortable container (`connectWith` option)
      if (!parseInt(this.currentContainer.options.animation, 10) || !axis) {
        // eslint-disable-next-line no-underscore-dangle, prefer-rest-params
        return this._superApply(arguments);
      }

      // call original _rearrange() at first, before access to item, which may be undefined
      // eslint-disable-next-line prefer-rest-params, no-underscore-dangle
      this._superApply(arguments);
      if (item == null) {
        // eslint-disable-next-line consistent-return
        return;
      }

      // eslint-disable-next-line prefer-const
      $item = $(item.item[0]);
      // if moved up, then move item up to its height,
      // if moved down, then move item down
      // eslint-disable-next-line prefer-const
      offset = `${(this.direction === "up" ? "" : "-") + $item[axis === "x" ? "width" : "height"]()}px`;

      // prepare starting css props
      if (useCssAnimation) {
        props[supports.transform] = `${axis === "x" ? "translateX" : "translateY"}(${offset})`;
      } else {
        props = {
          position: "relative",
        };
        props[axis === "x" ? "left" : "top"] = offset;
      }

      // set starting css props on item
      $item.css(props);

      // if css animations are not supported
      // use jQuery animations
      if (useCssAnimation) {
        props[supports.transition] = `${supports.transform} ${this.options.animation}ms`;
        props[supports.transform] = "";
        resetProps[supports.transform] = "";
        resetProps[supports.transition] = "";

        setTimeout(() => {
          $item.css(props);
        }, 0);
      } else {
        resetProps.top = "";
        resetProps.position = "";

        $item.animate(
          {
            top: "",
            position: "",
          },
          this.options.animation
        );
      }

      // after animation ends
      // clear changed for animation props
      setTimeout(() => {
        $item.css(resetProps);
      }, this.options.animation);
    },
  });
});
