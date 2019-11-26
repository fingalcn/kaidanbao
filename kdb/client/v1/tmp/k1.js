/**
*  Ajax Autocomplete for jQuery, version 1.2.24
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, plusplus: true, vars: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                },
                createNode: function (containerClass) {
                    var div = document.createElement('div');
                    div.className = containerClass;
                    div.style.position = 'absolute';
                    div.style.display = 'none';
                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };
    
    var auto_result_count=0,auto_id_cache={};//TODO modify by fingal
    function Autocomplete(el, options) {
        var noop = function () { },
            that = this,
            defaults = {
                ajaxSettings: {},
                autoSelectFirst: false,
                appendTo: document.body,
                serviceUrl: null,
                lookup: null,
                onSelect: null,
                width: 'auto',
                minChars: 1,
//                maxHeight: '200px',TODO modify by fingal
                maxHeight:'37%',
                deferRequestBy: 0,
                params: {},
                formatResult: Autocomplete.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: 'GET',
                noCache: false,
//                onSearchStart: noop, TODO modify by fingal
                onSearchStart: function(){
                	auto_id_cache={};auto_result_count=0;
                },
                onSearchComplete: noop,
                onSearchError: noop,
                preserveInput: false,
                containerClass: 'autocomplete-suggestions',
                tabDisabled: false,
                dataType: 'text',
                currentRequest: null,
                triggerSelectOnValidInput: true,
                preventBadQueries: true,
                lookupFilter: function (suggestion, originalQuery, queryLowerCase,ptype) {
//					TODO modify by fingal
//                	return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
                	if(auto_result_count > 50) return false;
                	if(ptype && suggestion.data.type!==ptype) return false;
	        		var q = queryLowerCase.split(' ');
		        	for(var i in q){ if(q[i] && suggestion.value.toLowerCase().indexOf(q[i]) === -1) return false; }
		        	if(auto_id_cache['i'+suggestion.data.id]) return false;
		        	else auto_id_cache['i'+suggestion.data.id]=1;
		        	auto_result_count++;
		        	return true;
                },
                paramName: 'query',
                transformResult: function (response) {
                    return typeof response === 'string' ? $.parseJSON(response) : response;
                },
                showNoSuggestionNotice: true,
                noSuggestionNotice: '<没有结果>',
                orientation: 'bottom',
                forceFixPosition: false
            };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
		//TODO repaire originalQuery is empty by fingal
//		if(currentValue === '') return suggestion.value;
        var ps = currentValue.split(' '),pattern,safe = suggestion.value;
        for(var i in ps){
        	if(ps[i]){
        		pattern = '(' + utils.escapeRegExChars(ps[i]) + ')';
        		safe = safe.replace(new RegExp(pattern, 'gi'), '<b>$1<\/b>');
        	}
        }
        return safe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?b)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if ($(e.target).closest('.' + that.options.containerClass).length === 0) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.width(options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },

        onFocus: function () {
            var that = this;
            that.fixPosition();
            if (that.options.minChars === 0 && that.el.val().length === 0) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            this.enableKillerFn();
        },
        
        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
//                'max-height': options.maxHeight + 'px',
//                'width': options.width + 'px',  
//            	edit by fingal for %
                'max-height': options.maxHeight,
                'width': options.width,
                'z-index': options.zIndex
            });
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if(containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                    if (!that.visible){
                        $container.css('opacity', 0).show();
                    }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible){
                    $container.css('opacity', opacity).hide();
                }
            }

            // -2px to account for suggestions border.
            if (that.options.width === 'auto') {
                styles.width = (that.el.outerWidth() - 2) + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function () {
            var that = this;
//            $(document).on('click.autocomplete', that.killerFn);
            $(document).on('mouseup.autocomplete', that.killerFn);//edit by fingal
        },

        disableKillerFn: function () {
            var that = this;
//            $(document).off('click.autocomplete', that.killerFn);
            $(document).off('mouseup.autocomplete', that.killerFn);//edit by fingal
        },

        killSuggestions: function () {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    that.el.val(that.currentValue);
                    that.hide();
                }
                
                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function () {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
//                    if (that.hint && that.options.onHint) {
//                        that.selectHint();
//                        return;
//                    }
//                    if (that.selectedIndex === -1) {
                        that.hide();
//                        return;
//                    }
//                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function (query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase,options.ptype);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)){
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            if (!this.options.preventBadQueries){
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function () {
            if (this.suggestions.length === 0) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
                    };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy){
                    html += formatGroup(suggestion, value, i);
                }

//                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value) + '</div>';
                //edit by fingal for price
                html += '<div class="' + className +' '+(suggestion.data.c?suggestion.data.c:'')+ '" data-index="' + i + '"><div class="l">' + formatResult(suggestion, value) + '</div><div class="r">'+(suggestion.data.r?suggestion.data.r:'')+'</div></div>';
            });
            //new button by fingal
            if(options.newButton) html +=options.newButton;

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function() {
             var that = this,
                 container = $(that.suggestionsContainer),
                 noSuggestionsContainer = $(that.noSuggestionsContainer);

             this.adjustContainerWidth();
            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            //new button by fingal
            if(that.options.newButton) container.append(that.options.newButton);
            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            // -2px to account for suggestions border.
            if (options.width === 'auto') {
                width = that.el.outerWidth() - 2;
                container.width(width > 0 ? width : 300);
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if($.inArray(orientation, ['auto', 'bottom', 'top']) === -1){
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && result.suggestions.length === 0) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (arguments.length === 0) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
}));
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
    	$('#facebox').fadeOut(function() {
    	      $('#facebox .content').removeClass().addClass('content');
    	      $('#facebox .loading').remove();
    	      $(document).trigger('afterClose.facebox');
    	    });
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
/**
 * 所有客户端js写在这一个文件中，后续文件大了，采用node模块化拆分，保证核心过程和工具不依赖第三方库
 * 文件加载顺序：
 * 页面跳转依赖url hash
 */
;(function(a,b){
	//文档顺序加载，定义参数
	a.kaidanbao = {};
	window.addEventListener('DOMContentLoaded', function(){
		//require(k.utils)
		b(a.kaidanbao);
		//标签可见性切换
		document.addEventListener('visibilitychange', function(){
//			console.log(document['visibilityState']);//visible or hidden
		});
		//屏幕旋转监听
		window.addEventListener('orientationchange', function(){
//			console.log(document.body.clientWidth);
//			console.log(document.body.clientHeight);
		});
    });
	//捕获全局错误
//	window.onerror=function(msg,url,l){
//		console.log("Error: " + msg);
//		console.log("URL: " + url);
//		console.log("Line: " + l);
//	}
})(window,function(k){
	k.frame.init();
	window.addEventListener('hashchange',k.frame.hashchangeHandle);
	//有更新，准备下载
	window.applicationCache.ondownloading = function(){
		//仅当用户登录过开单宝才提示更新
		if(window.localStorage['k']) k.aspect.noty.progress('更新中。。。');
	}
	//首次缓存成功
	window.applicationCache.oncached = function(){
		if(window.localStorage['k']) window.location.href = './';
	}
	//再次缓存更新成功
	window.applicationCache.onupdateready = function(){
		if(window.localStorage['k']) window.location.href = './';
	}
	//存储事件，同一浏览器只能登录一个开单宝账号
	window.addEventListener('storage',function(event){
		if(k.cache.sign.loaded) {//已登录触发事件
			window.location.href = '/';
		}
	});
});

/**
 * http://usejsdoc.org/
 */
(function(k){
	var pinyin_already_init=false;
	k.utils={
		valid_loginname:function(val){
			//校验用户名
			if(/^[0-9a-zA-Z]{2,16}$/.test(val)){
				return true;
			}else k.aspect.noty.message('用户名由字母和数字组成');
			
		},
		valid_mobile:function(val){
			//校验手机号
			if(/^1[3-8][0-9]{9}$/.test(val)){
				return true;
			}else k.aspect.noty.message('手机号码不对');
		},
		valid_password:function(val){
			//校验密码
			if(val.length < 5){
				k.aspect.noty.message('密码太短！');
			}else return true;
		},
		valid_hanname:function(val){
			//校验商户简称、昵称
			if(/^[^\s]{2,8}$/.test(val)){
				return true;
			}else k.aspect.noty.message('名称由2到8个文字组成！');
		},
		is_float: function(input){  
		     var re = /^(-?\d+)(\.\d+)?$/;         
		     if (re.test(input)) return true;
		     else false; 
		},
		file:(function(){
//		    var uri = {excel: 'data:application/vnd.ms-excel;base64,', csv: 'data:application/csv;base64,'};
		    var template = {excel: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>'};
		    var csvDelimiter = ",";
		    var csvNewLine = "\r\n";
		    var format = function(s, c) {
		        return s.replace(new RegExp("{(\\w+)}", "g"), function(m, p) {
		            return c[p];
		        });
		    };
			var saveAs=function(blob, filename) {
			    var type = blob.type;
			    var force_saveable_type = 'application/octet-stream';
			    if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
			        var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
			        blob = slice.call(blob, 0, blob.size, force_saveable_type);
			    }

			    var url = URL.createObjectURL(blob);
			    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
			    save_link.href = url;
			    save_link.download = filename;

			    var event = document.createEvent('MouseEvents');
			    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			    save_link.dispatchEvent(event);
			    URL.revokeObjectURL(url);
			};
			var readAsText=function(file,comp){
				var reader=new FileReader();
				reader.readAsText(file);
				reader.onload = function() {
					comp(this.result);
				}
			};
			return {
				tableToExcel: function(table_html,filename) {
					var excelValue = format(template.excel,{worksheet: filename,table: table_html});
		            saveAs(new Blob([excelValue],{'type':'text/plain;charset=utf-8'}),filename+'.xls');
		        },
		        excelToTable:function(file,comp){
		        	if(file){
		        		readAsText(file,function(r){
		        			comp(r.substring(r.indexOf('<table'),r.indexOf('</table')+8));
		        		});
		        	}else comp();
		        }
			};
		})(),
		DX:function (num) {  
			  var strOutput = "";  
			  var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';  
			      num += "00";  
			  var intPos = num.indexOf('.');  
			  if (intPos >= 0) num = num.substring(0, intPos) + num.substr(intPos + 1, 2);  
			  strUnit = strUnit.substr(strUnit.length - num.length);  
			  for (var i=0; i < num.length; i++)  
			    strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i,1),1) + strUnit.substr(i,1);  
			  return strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
		},
		date:{
			picker:function(clazz,conf){
				conf = k.utils.extend(conf,{
					format: "yyyy-mm-dd",
				    weekStart: 0,
				    todayBtn: 'linked',
				    clearBtn: true,
				    language: "zh-CN",
				    todayHighlight: true,
				    autoclose: true
				});
				$(clazz).datepicker(conf);
			},
			getDayTimestamp:function(date){
				//YYYY-MM-DD,获取指定日期时间戳
				return new Date(date.replace(/-/g,'/')).getTime();
			},
			getNow:function(){
				//获取当前毫秒数
				return new Date().getTime();
			},
			getDay:function(n,start){
				var first = start?new Date(start).getTime():new Date().getTime();
				//日期YYYY-MM-DD，n为相对于今天的偏离天数，可以为实数
				if(n) return k.utils.date.getTimeFormat(first+(n*86400000),'d');
				else return k.utils.date.getTimeFormat(0,'d');
			},
			getTimeFormat:function(time,mode){
				//统一为格式：YYYY-MM-DD hh-mm-ss.SSS，
				//@time : 时间戳毫秒数，
				//@mode : 'd' YYYY-MM-DD;'t'hh-mm-ss;'dt' YYYY-MM-DD hh-mm-ss;
				var dt = time?new Date(time):new Date();
				var YYYY = dt.getFullYear(),
				    MM   = dt.getMonth()+1,
				    DD   = dt.getDate(),
				    hh   = dt.getHours(),
				    mm   = dt.getMinutes(),
				    ss   = dt.getSeconds();
				if(mode === 'd'){
					MM = (MM>9?MM:('0'+MM));
					DD = (DD>9?DD:('0'+DD));
					return YYYY+'-'+MM+'-'+DD;
				}else if(mode === 't'){ 
					hh = (hh>9?hh:('0'+hh));
					mm = (mm>9?mm:('0'+mm));
					ss = (ss>9?ss:('0'+ss));
					return hh+':'+mm+':'+ss;
				}else{ 
					MM = (MM>9?MM:('0'+MM));
					DD = (DD>9?DD:('0'+DD));
					hh = (hh>9?hh:('0'+hh));
					mm = (mm>9?mm:('0'+mm));
					ss = (ss>9?ss:('0'+ss));
					return YYYY+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
				}
			},
			get_before_yms:function(n){
				var day = new Date().getDate();
				var yms =[];
				yms.push(k.utils.date.getDay().substr(0, 7));
				for(var i=0;i<n-1;i++){
					yms.push(k.utils.date.getDay(-1-day-(31*i)).substr(0, 7));
				}
				return yms;
			},
		},
		pinyin:{
			dict:{},
			yinbiao:{"ā": "a1","á": "a2","ǎ": "a3","à": "a4","ē": "e1","é": "e2","ě": "e3","è": "e4","ō": "o1","ó": "o2","ǒ": "o3","ò": "o4","ī": "i1","í": "i2","ǐ": "i3","ì": "i4","ū": "u1","ú": "u2","ǔ": "u3","ù": "u4","ü": "v0","ǘ": "v2","ǚ": "v3","ǜ": "v4","ń": "n2","ň": "n3","": "m2"},
			init:function(){
				if(pinyin_already_init === false){
					pinyin_already_init=true;
					var pmap={"èr":"二贰","shí":"十时实蚀","yǐ":"乙已以蚁倚","yī":"一衣医依伊揖壹","chǎng,ān,hàn":"厂","dīng,zhēng":"丁","qī":"七戚欺漆柒凄嘁","bǔ,bo":"卜","rén":"人仁","rù":"入褥","jiǔ":"九久酒玖灸韭","ér":"儿而","bā":"八巴疤叭芭捌笆","jǐ,jī":"几","le,liǎo":"了","lì":"力历厉立励利例栗粒吏枥沥荔俐莉砾雳痢","dāo":"刀","nǎi":"乃奶","sān":"三叁","yòu":"又右幼诱佑","yú":"于余鱼娱渔榆愚隅逾舆","shì":"士示世市式势事侍饰试视柿是适室逝释誓拭恃嗜","gān,gàn":"干","gōng":"工弓公功攻宫恭躬","kuī":"亏盔窥","tǔ":"土","cùn":"寸","dà,dài,tài":"大","cái":"才材财裁","xià":"下夏","zhàng":"丈仗帐胀障杖账","yǔ,yù,yú":"与","shàng,shǎng":"上","wàn,mò":"万","kǒu":"口","xiǎo":"小晓","jīn":"巾斤今金津筋襟","shān":"山删衫珊","qiān":"千迁牵谦签","qǐ":"乞企启起","chuān":"川穿","gè,gě":"个各","sháo":"勺芍","yì":"亿义艺忆议亦异役译易疫益谊意毅翼屹抑邑绎奕逸肄溢","jí":"及吉级极即急疾集籍棘辑嫉","fán":"凡烦矾樊","xī":"夕西吸希析牺息悉惜稀锡溪熄膝昔晰犀熙嬉蟋","wán":"丸完玩顽","me,mó,ma,yāo":"么","guǎng,ān":"广","wáng,wú":"亡","mén":"门们","shī":"尸失师诗狮施湿虱","zhī":"之支汁芝肢脂蜘","jǐ":"己挤脊","zǐ":"子紫姊籽滓","wèi":"卫未位味畏胃喂慰谓猬蔚魏","yě":"也冶野","nǚ,rǔ":"女","rèn":"刃认韧纫","fēi":"飞非啡","xí":"习席袭媳","mǎ":"马码玛","chā,chá,chǎ":"叉","fēng":"丰封疯峰锋蜂枫","xiāng":"乡香箱厢湘镶","jǐng":"井警阱","wáng,wàng":"王","kāi":"开揩","tiān":"天添","wú":"无吴芜梧蜈","fū,fú":"夫","zhuān":"专砖","yuán":"元园原圆援缘源袁猿辕","yún":"云匀耘","zhā,zā,zhá":"扎","mù":"木目牧墓幕暮慕沐募睦穆","wǔ":"五午伍武侮舞捂鹉","tīng":"厅听","bù,fǒu":"不","qū,ōu":"区","quǎn":"犬","tài":"太态泰汰","yǒu":"友","chē,jū":"车","pǐ":"匹","yóu":"尤由邮犹油游","jù":"巨拒具俱剧距惧锯聚炬","yá":"牙芽崖蚜涯衙","bǐ":"比彼笔鄙匕秕","jiē":"皆阶接街秸","hù":"互户护沪","qiè,qiē":"切","wǎ,wà":"瓦","zhǐ":"止旨址纸指趾","tún,zhūn":"屯","shǎo,shào":"少","rì":"日","zhōng,zhòng":"中","gāng":"冈刚纲缸肛","nèi,nà":"内","bèi":"贝备倍辈狈惫焙","shuǐ":"水","jiàn,xiàn":"见","niú":"牛","shǒu":"手守首","máo":"毛矛茅锚","qì":"气弃汽器迄泣","shēng":"升生声牲笙甥","cháng,zhǎng":"长","shén,shí":"什","piàn,piān":"片","pú,pū":"仆","huà,huā":"化","bì":"币必毕闭毙碧蔽弊避壁庇蓖痹璧","chóu,qiú":"仇","zhuǎ,zhǎo":"爪","jǐn,jìn":"仅","réng":"仍","fù,fǔ":"父","cóng,zòng":"从","fǎn":"反返","jiè":"介戒届界借诫","xiōng":"凶兄胸匈汹","fēn,fèn":"分","fá":"乏伐罚阀筏","cāng":"仓苍舱沧","yuè":"月阅悦跃越岳粤","shì,zhī":"氏","wù":"勿务物误悟雾坞晤","qiàn":"欠歉","fēng,fěng":"风","dān":"丹耽","wū":"乌污呜屋巫诬","fèng":"凤奉","gōu,gòu":"勾","wén":"文闻蚊","liù,lù":"六","huǒ":"火伙","fāng":"方芳","dǒu,dòu":"斗","wèi,wéi":"为","dìng":"订定锭","jì":"计记技忌际季剂迹既继寄绩妓荠寂鲫冀","xīn":"心辛欣新薪锌","chǐ,chě":"尺","yǐn":"引饮蚓瘾","chǒu":"丑","kǒng":"孔恐","duì":"队对","bàn":"办半扮伴瓣绊","yǔ,yú":"予","yǔn":"允陨","quàn":"劝","shū":"书叔殊梳舒疏输蔬抒枢淑","shuāng":"双霜","yù":"玉育狱浴预域欲遇御裕愈誉芋郁喻寓豫","huàn":"幻换唤患宦涣焕痪","kān":"刊堪勘","mò":"末沫漠墨默茉陌寞","jī":"击饥圾机肌鸡积基激讥叽唧畸箕","dǎ,dá":"打","qiǎo":"巧","zhèng,zhēng":"正症挣","pū":"扑","bā,pá":"扒","gān":"甘肝竿柑","qù":"去","rēng":"扔","gǔ":"古谷股鼓","běn":"本","jié,jiē":"节结","shù,shú,zhú":"术","bǐng":"丙柄饼秉禀","kě,kè":"可","zuǒ":"左","bù":"布步怖部埠","shí,dàn":"石","lóng":"龙聋隆咙胧窿","yà":"轧亚讶","miè":"灭蔑","píng":"平评凭瓶萍坪","dōng":"东冬","kǎ,qiǎ":"卡","běi,bèi":"北","yè":"业页夜液谒腋","jiù":"旧救就舅臼疚","shuài":"帅蟀","guī":"归规闺硅瑰","zhàn,zhān":"占","dàn":"旦但诞淡蛋氮","qiě,jū":"且","yè,xié":"叶","jiǎ":"甲钾","dīng":"叮盯","shēn":"申伸身深呻绅","hào,háo":"号","diàn":"电店垫殿玷淀惦奠","tián":"田甜恬","shǐ":"史使始驶矢屎","zhī,zhǐ":"只","yāng":"央殃秧鸯","diāo":"叼雕刁碉","jiào":"叫轿较窖酵","lìng":"另","dāo,tāo":"叨","sì":"四寺饲肆","tàn":"叹炭探碳","qiū":"丘秋蚯","hé":"禾河荷盒","fù":"付负妇附咐赴复傅富腹覆赋缚","dài":"代带贷怠袋逮戴","xiān":"仙先掀锨","yí":"仪宜姨移遗夷胰","bái":"白","zǎi,zǐ,zī":"仔","chì":"斥赤翅","tā":"他它塌","guā":"瓜刮","hū":"乎呼忽","cóng":"丛","lìng,líng,lǐng":"令","yòng":"用","shuǎi":"甩","yìn":"印","lè,yuè":"乐","jù,gōu":"句","cōng":"匆葱聪囱","fàn":"犯饭泛范贩","cè":"册厕测策","wài":"外","chù,chǔ":"处","niǎo":"鸟","bāo":"包胞苞褒","zhǔ":"主煮嘱拄","shǎn":"闪陕","lán":"兰拦栏蓝篮澜","tóu,tou":"头","huì":"汇绘贿惠慧讳诲晦秽","hàn":"汉旱捍悍焊撼翰憾","tǎo":"讨","xué":"穴学","xiě":"写","níng,nìng,zhù":"宁","ràng":"让","lǐ":"礼李里理鲤","xùn":"训讯迅汛驯逊殉","yǒng":"永咏泳勇蛹踊","mín":"民","chū":"出初","ní":"尼","sī":"司丝私斯撕嘶","liáo":"辽疗僚聊寥嘹缭","jiā":"加佳嘉枷","nú":"奴","zhào,shào":"召","biān":"边编鞭蝙","pí":"皮疲脾啤","yùn":"孕运韵酝蕴","fā,fà":"发","shèng":"圣胜剩","tái,tāi":"台苔","jiū":"纠究揪鸠","mǔ":"母亩牡拇姆","káng,gāng":"扛","xíng":"刑形型邢","dòng":"动冻栋洞","kǎo":"考烤拷","kòu":"扣寇","tuō":"托拖脱","lǎo":"老","gǒng":"巩汞拱","zhí":"执直侄值职植","kuò":"扩阔廓","yáng":"扬阳杨洋","dì,de":"地","sǎo,sào":"扫","chǎng,cháng":"场","ěr":"耳尔饵","máng":"芒忙盲茫","xiǔ":"朽","pǔ,pò,pō,piáo":"朴","quán":"权全泉拳痊","guò,guo,guō":"过","chén":"臣尘辰沉陈晨忱","zài":"再在","xié":"协胁斜携鞋谐","yā,yà":"压","yàn":"厌艳宴验雁焰砚唁谚堰","yǒu,yòu":"有","cún":"存","bǎi":"百摆","kuā,kuà":"夸","jiàng":"匠酱","duó":"夺踱","huī":"灰挥恢辉徽","dá":"达","sǐ":"死","liè":"列劣烈猎","guǐ":"轨鬼诡","xié,yá,yé,yú,xú":"邪","jiá,jiā,gā,xiá":"夹","chéng":"成呈诚承城程惩橙","mài":"迈麦卖","huà,huá":"划","zhì":"至志帜制质治致秩智置挚掷窒滞稚","cǐ":"此","zhēn":"贞针侦珍真斟榛","jiān":"尖奸歼坚肩艰兼煎","guāng":"光","dāng,dàng":"当","zǎo":"早枣澡蚤藻","tù,tǔ":"吐","xià,hè":"吓","chóng":"虫崇","tuán":"团","tóng,tòng":"同","qū,qǔ":"曲","diào":"吊钓掉","yīn":"因阴音姻茵","chī":"吃嗤痴","ma,má,mǎ":"吗","yǔ":"屿宇羽","fān":"帆翻","huí":"回茴蛔","qǐ,kǎi":"岂","zé":"则责","suì":"岁碎穗祟遂隧","ròu":"肉","zhū,shú":"朱","wǎng":"网往枉","nián":"年","diū":"丢","shé":"舌","zhú":"竹逐烛","qiáo":"乔侨桥瞧荞憔","wěi":"伟伪苇纬萎","chuán,zhuàn":"传","pāng":"乓","pīng":"乒","xiū,xǔ":"休","fú":"伏扶俘浮符幅福凫芙袱辐蝠","yōu":"优忧悠幽","yán":"延严言岩炎沿盐颜阎蜒檐","jiàn":"件建荐贱剑健舰践鉴键箭涧","rèn,rén":"任","huá,huà,huā":"华","jià,jiè,jie":"价","shāng":"伤商","fèn,bīn":"份","fǎng":"仿访纺","yǎng,áng":"仰","zì":"自字","xiě,xuè":"血","xiàng":"向项象像橡","sì,shì":"似","hòu":"后厚候","zhōu":"舟州周洲","háng,xíng":"行","huì,kuài":"会","shā":"杀纱杉砂","hé,gě":"合","zhào":"兆赵照罩","zhòng":"众仲","yé":"爷","sǎn":"伞","chuàng,chuāng":"创","duǒ":"朵躲","wēi":"危威微偎薇巍","xún":"旬寻巡询循","zá":"杂砸","míng":"名明鸣铭螟","duō":"多哆","zhēng":"争征睁筝蒸怔狰","sè":"色涩瑟","zhuàng":"壮状撞","chōng,chòng":"冲","bīng":"冰兵","zhuāng":"庄装妆桩","qìng":"庆","liú":"刘留流榴琉硫瘤","qí,jì,zī,zhāi":"齐","cì":"次赐","jiāo":"交郊浇娇骄胶椒焦蕉礁","chǎn":"产铲阐","wàng":"妄忘旺望","chōng":"充","wèn":"问","chuǎng":"闯","yáng,xiáng":"羊","bìng,bīng":"并","dēng":"灯登蹬","mǐ":"米","guān":"关官棺","hàn,hán":"汗","jué":"决绝掘诀爵","jiāng":"江姜僵缰","tāng,shāng":"汤","chí":"池驰迟持弛","xīng,xìng":"兴","zhái":"宅","ān":"安氨庵鞍","jiǎng":"讲奖桨蒋","jūn":"军均君钧","xǔ,hǔ":"许","fěng":"讽","lùn,lún":"论","nóng":"农浓脓","shè":"设社舍涉赦","nà,nǎ,nèi,nā":"那","jìn,jǐn":"尽","dǎo":"导岛蹈捣祷","sūn,xùn":"孙","zhèn":"朕圳阵振震镇","shōu":"收","fáng":"防妨房肪","rú":"如儒蠕","mā":"妈","xì,hū":"戏","hǎo,hào":"好","tā,jiě":"她","guān,guàn":"观冠","huān":"欢","hóng,gōng":"红","mǎi":"买","xiān,qiàn":"纤","jì,jǐ":"纪济","yuē,yāo":"约","shòu":"寿受授售兽瘦","nòng,lòng":"弄","jìn":"进近晋浸","wéi":"违围唯维桅","yuǎn,yuàn":"远","tūn":"吞","tán":"坛谈痰昙谭潭檀","fǔ":"抚斧府俯辅腐甫脯","huài,pēi,pī,péi":"坏","rǎo":"扰","pī":"批披坯霹","zhǎo":"找沼","chě":"扯","zǒu":"走","chāo":"抄钞超","bà":"坝爸霸","gòng":"贡","zhé,shé,zhē":"折","qiǎng,qiāng,chēng":"抢","zhuā":"抓","xiào":"孝笑效哮啸","pāo":"抛","tóu":"投","kàng":"抗炕","fén":"坟焚","kēng":"坑","dǒu":"抖陡蚪","ké,qiào":"壳","fāng,fáng":"坊","niǔ":"扭纽钮","kuài":"块快筷","bǎ,bà":"把","bào":"报抱爆豹","jié":"劫杰洁捷截竭","què":"却确鹊","huā":"花","fēn":"芬吩纷氛","qín":"芹琴禽勤秦擒","láo":"劳牢","lú":"芦炉卢庐颅","gān,gǎn":"杆","kè":"克刻客课","sū,sù":"苏","dù":"杜渡妒镀","gàng,gāng":"杠","cūn":"村","qiú":"求球囚","xìng":"杏幸性姓","gèng,gēng":"更","liǎng":"两","lì,lí":"丽","shù":"束述树竖恕庶墅漱","dòu":"豆逗痘","hái,huán":"还","fǒu,pǐ":"否","lái":"来莱","lián":"连怜帘莲联廉镰","xiàn,xuán":"县","zhù,chú":"助","dāi":"呆","kuàng":"旷况矿框眶","ya,yā":"呀","zú":"足族","dūn":"吨蹲墩","kùn":"困","nán":"男","chǎo,chāo":"吵","yuán,yún,yùn":"员","chuàn":"串","chuī":"吹炊","ba,bā":"吧","hǒu":"吼","gǎng":"岗","bié,biè":"别","dīng,dìng":"钉","gào":"告","wǒ":"我","luàn":"乱","tū":"秃突凸","xiù":"秀袖绣锈嗅","gū,gù":"估","měi":"每美","hé,hē,hè":"何","tǐ,tī,bèn":"体","bó,bǎi,bà":"伯","zuò":"作坐座做","líng":"伶灵铃陵零龄玲凌菱蛉翎","dī":"低堤滴","yòng,yōng":"佣","nǐ":"你拟","zhù":"住注驻柱祝铸贮蛀","zào":"皂灶造燥躁噪","fó,fú,bì,bó":"佛","chè":"彻撤澈","tuǒ":"妥椭","lín":"邻林临琳磷鳞","hán":"含寒函涵韩","chà":"岔衩","cháng":"肠尝常偿","dù,dǔ":"肚","guī,jūn,qiū":"龟","miǎn":"免勉娩冕缅","jiǎo,jué":"角","kuáng":"狂","tiáo,tiāo":"条","luǎn":"卵","yíng":"迎盈营蝇赢荧莹萤","xì,jì":"系","chuáng":"床","kù":"库裤酷","yìng,yīng":"应","lěng":"冷","zhè,zhèi":"这","xù":"序叙绪续絮蓄旭恤酗婿","xián":"闲贤弦咸衔嫌涎舷","jiān,jiàn":"间监","pàn":"判盼叛畔","mēn,mèn":"闷","wāng":"汪","dì,tì,tuí":"弟","shā,shà":"沙","shà,shā":"煞","càn":"灿璨","wò":"沃卧握","méi,mò":"没","gōu":"沟钩","shěn,chén":"沈","huái":"怀槐徊淮","sòng":"宋送诵颂讼","hóng":"弘泓宏虹洪鸿","qióng":"穷琼","zāi":"灾栽","liáng":"良梁粮粱","zhèng":"证郑政","bǔ":"补捕哺","sù":"诉肃素速塑粟溯","shí,zhì":"识","cí":"词辞慈磁祠瓷雌","zhěn":"诊枕疹","niào,suī":"尿","céng":"层","jú":"局菊橘","wěi,yǐ":"尾","zhāng":"张章彰樟","gǎi":"改","lù":"陆录鹿路赂","ē,ā":"阿","zǔ":"阻组祖诅","miào":"妙庙","yāo":"妖腰邀夭吆","nǔ":"努","jìn,jìng":"劲","rěn":"忍","qū":"驱屈岖蛆躯","chún":"纯唇醇","nà":"纳钠捺","bó":"驳脖博搏膊舶渤","zòng,zǒng":"纵","wén,wèn":"纹","lǘ":"驴","huán":"环","qīng":"青轻倾清蜻氢卿","xiàn":"现限线宪陷馅羡献腺","biǎo":"表","mǒ,mò,mā":"抹","lǒng":"拢垄","dān,dàn,dǎn":"担","bá":"拔跋","jiǎn":"拣茧俭捡检减剪简柬碱","tǎn":"坦毯袒","chōu":"抽","yā":"押鸦鸭","guǎi":"拐","pāi":"拍","zhě":"者","dǐng":"顶鼎","yōng":"拥庸","chāi,cā":"拆","dǐ":"抵","jū,gōu":"拘","lā":"垃","lā,lá":"拉","bàn,pàn":"拌","zhāo":"招昭","pō":"坡泼颇","bō":"拨波玻菠播","zé,zhái":"择","tái":"抬","qí,jī":"其奇","qǔ":"取娶","kǔ":"苦","mào":"茂贸帽貌","ruò,rě":"若","miáo":"苗描瞄","píng,pēng":"苹","yīng":"英樱鹰莺婴缨鹦","qié":"茄","jīng":"茎京经惊晶睛精荆兢鲸","zhī,qí":"枝","bēi":"杯悲碑卑","guì,jǔ":"柜","bǎn":"板版","sōng":"松","qiāng":"枪腔","gòu":"构购够垢","sàng,sāng":"丧","huà":"画话桦","huò":"或货获祸惑霍","cì,cī":"刺","yǔ,yù":"雨语","bēn,bèn":"奔","fèn":"奋粪愤忿","hōng":"轰烘","qī,qì":"妻","ōu":"欧殴鸥","qǐng":"顷请","zhuǎn,zhuàn,zhuǎi":"转","zhǎn":"斩盏展","ruǎn":"软","lún":"轮仑伦沦","dào":"到盗悼道稻","chǐ":"齿耻侈","kěn":"肯垦恳啃","hǔ":"虎","xiē,suò":"些","lǔ":"虏鲁卤","shèn":"肾渗慎","shàng":"尚","guǒ":"果裹","kūn":"昆坤","guó":"国","chāng":"昌猖","chàng":"畅唱","diǎn":"典点碘","gù":"固故顾雇","áng":"昂","zhōng":"忠终钟盅衷","ne,ní":"呢","àn":"岸按案暗","tiě,tiē,tiè,":"帖","luó":"罗萝锣箩骡螺逻","kǎi":"凯慨","lǐng,líng":"岭","bài":"败拜","tú":"图徒途涂屠","chuí":"垂锤捶","zhī,zhì":"知织","guāi":"乖","gǎn":"秆赶敢感橄","hé,hè,huó,huò,hú":"和","gòng,gōng":"供共","wěi,wēi":"委","cè,zè,zhāi":"侧","pèi":"佩配沛","pò,pǎi":"迫","de,dì,dí":"的","pá":"爬","suǒ":"所索锁琐","jìng":"径竞竟敬静境镜靖","mìng":"命","cǎi,cài":"采","niàn":"念","tān":"贪摊滩瘫","rǔ":"乳辱","pín":"贫","fū":"肤麸孵敷","fèi":"肺废沸费吠","zhǒng":"肿","péng":"朋棚蓬膨硼鹏澎篷","fú,fù":"服","féi":"肥","hūn":"昏婚荤","tù":"兔","hú":"狐胡壶湖蝴弧葫","gǒu":"狗苟","bǎo":"饱宝保","xiǎng":"享响想","biàn":"变遍辨辩辫","dǐ,de":"底","jìng,chēng":"净","fàng":"放","nào":"闹","zhá":"闸铡","juàn,juǎn":"卷","quàn,xuàn":"券","dān,shàn,chán":"单","chǎo":"炒","qiǎn,jiān":"浅","fǎ":"法","xiè,yì":"泄","lèi":"泪类","zhān":"沾粘毡瞻","pō,bó":"泊","pào,pāo":"泡","xiè":"泻卸屑械谢懈蟹","ní,nì":"泥","zé,shì":"泽","pà":"怕帕","guài":"怪","zōng":"宗棕踪","shěn":"审婶","zhòu":"宙昼皱骤咒","kōng,kòng,kǒng":"空","láng,làng":"郎","chèn":"衬趁","gāi":"该","xiáng,yáng":"详","lì,dài":"隶","jū":"居鞠驹","shuā,shuà":"刷","mèng":"孟梦","gū":"孤姑辜咕沽菇箍","jiàng,xiáng":"降","mèi":"妹昧媚","jiě":"姐","jià":"驾架嫁稼","cān,shēn,cēn,sān":"参","liàn":"练炼恋链","xì":"细隙","shào":"绍哨","tuó":"驼驮鸵","guàn":"贯惯灌罐","zòu":"奏揍","chūn":"春椿","bāng":"帮邦梆","dú,dài":"毒","guà":"挂卦褂","kuǎ":"垮","kuà,kū":"挎","náo":"挠","dǎng,dàng":"挡","shuān":"拴栓","tǐng":"挺艇","kuò,guā":"括","shí,shè":"拾","tiāo,tiǎo":"挑","wā":"挖蛙洼","pīn":"拼","shèn,shén":"甚","mǒu":"某","nuó":"挪","gé":"革阁格隔","xiàng,hàng":"巷","cǎo":"草","chá":"茶察茬","dàng":"荡档","huāng":"荒慌","róng":"荣绒容熔融茸蓉溶榕","nán,nā":"南","biāo":"标彪膘","yào":"药耀","kū":"枯哭窟","xiāng,xiàng":"相","chá,zhā":"查","liǔ":"柳","bǎi,bó,bò":"柏","yào,yāo":"要","wāi":"歪","yán,yàn":"研","lí":"厘狸离犁梨璃黎漓篱","qì,qiè":"砌","miàn":"面","kǎn":"砍坎","shuǎ":"耍","nài":"耐奈","cán":"残蚕惭","zhàn":"战站栈绽蘸","bèi,bēi":"背","lǎn":"览懒揽缆榄","shěng,xǐng":"省","xiāo,xuē":"削","zhǎ":"眨","hǒng,hōng,hòng":"哄","xiǎn":"显险","mào,mò":"冒","yǎ,yā":"哑","yìng":"映硬","zuó":"昨","xīng":"星腥猩","pā":"趴","guì":"贵桂跪刽","sī,sāi":"思","xiā":"虾瞎","mǎ,mā,mà":"蚂","suī":"虽","pǐn":"品","mà":"骂","huá,huā":"哗","yè,yàn,yān":"咽","zán,zǎ":"咱","hā,hǎ,hà":"哈","yǎo":"咬舀","nǎ,něi,na,né":"哪","hāi,ké":"咳","xiá":"峡狭霞匣侠暇辖","gǔ,gū":"骨","gāng,gàng":"钢","tiē":"贴","yào,yuè":"钥","kàn,kān":"看","jǔ":"矩举","zěn":"怎","xuǎn":"选癣","zhòng,zhǒng,chóng":"种","miǎo":"秒渺藐","kē":"科棵颗磕蝌","biàn,pián":"便","zhòng,chóng":"重","liǎ":"俩","duàn":"段断缎锻","cù":"促醋簇","shùn":"顺瞬","xiū":"修羞","sú":"俗","qīn":"侵钦","xìn,shēn":"信","huáng":"皇黄煌凰惶蝗蟥","zhuī,duī":"追","jùn":"俊峻骏竣","dài,dāi":"待","xū":"须虚需","hěn":"很狠","dùn":"盾顿钝","lǜ":"律虑滤氯","pén":"盆","shí,sì,yì":"食","dǎn":"胆","táo":"逃桃陶萄淘","pàng":"胖","mài,mò":"脉","dú":"独牍","jiǎo":"狡饺绞脚搅","yuàn":"怨院愿","ráo":"饶","wān":"弯湾豌","āi":"哀哎埃","jiāng,jiàng":"将浆","tíng":"亭庭停蜓廷","liàng":"亮谅辆晾","dù,duó":"度","chuāng":"疮窗","qīn,qìng":"亲","zī":"姿资滋咨","dì":"帝递第蒂缔","chà,chā,chāi,cī":"差","yǎng":"养氧痒","qián":"前钱钳潜黔","mí":"迷谜靡","nì":"逆昵匿腻","zhà,zhá":"炸","zǒng":"总","làn":"烂滥","pào,páo,bāo":"炮","tì":"剃惕替屉涕","sǎ,xǐ":"洒","zhuó":"浊啄灼茁卓酌","xǐ,xiǎn":"洗","qià":"洽恰","pài":"派湃","huó":"活","rǎn":"染","héng":"恒衡","hún":"浑魂","nǎo":"恼脑","jué,jiào":"觉","hèn":"恨","xuān":"宣轩喧","qiè":"窃怯","biǎn,piān":"扁","ǎo":"袄","shén":"神","shuō,shuì,yuè":"说","tuì":"退蜕","chú":"除厨锄雏橱","méi":"眉梅煤霉玫枚媒楣","hái":"孩","wá":"娃","lǎo,mǔ":"姥","nù":"怒","hè":"贺赫褐鹤","róu":"柔揉蹂","bǎng":"绑膀","lěi":"垒蕾儡","rào":"绕","gěi,jǐ":"给","luò":"骆洛","luò,lào":"络","tǒng":"统桶筒捅","gēng":"耕羹","hào":"耗浩","bān":"班般斑搬扳颁","zhū":"珠株诸猪蛛","lāo":"捞","fěi":"匪诽","zǎi,zài":"载","mái,mán":"埋","shāo,shào":"捎稍","zhuō":"捉桌拙","niē":"捏","kǔn":"捆","dū,dōu":"都","sǔn":"损笋","juān":"捐鹃","zhé":"哲辙","rè":"热","wǎn":"挽晚碗惋婉","ái,āi":"挨","mò,mù":"莫","è,wù,ě,wū":"恶","tóng":"桐铜童彤瞳","xiào,jiào":"校","hé,hú":"核","yàng":"样漾","gēn":"根跟","gē":"哥鸽割歌戈","chǔ":"础储楚","pò":"破魄","tào":"套","chái":"柴豺","dǎng":"党","mián":"眠绵棉","shài":"晒","jǐn":"紧锦谨","yūn,yùn":"晕","huàng,huǎng":"晃","shǎng":"晌赏","ēn":"恩","ài,āi":"唉","ā,á,ǎ,à,a":"啊","bà,ba,pí":"罢","zéi":"贼","tiě":"铁","zuàn,zuān":"钻","qiān,yán":"铅","quē":"缺","tè":"特","chéng,shèng":"乘","dí":"迪敌笛涤嘀嫡","zū":"租","chèng":"秤","mì,bì":"秘泌","chēng,chèn,chèng":"称","tòu":"透","zhài":"债寨","dào,dǎo":"倒","tǎng,cháng":"倘","chàng,chāng":"倡","juàn":"倦绢眷","chòu,xiù":"臭","shè,yè,yì":"射","xú":"徐","háng":"航杭","ná":"拿","wēng":"翁嗡","diē":"爹跌","ài":"爱碍艾隘","gē,gé":"胳搁","cuì":"脆翠悴粹","zàng":"脏葬","láng":"狼廊琅榔","féng":"逢","è":"饿扼遏愕噩鳄","shuāi,cuī":"衰","gāo":"高糕羔篙","zhǔn":"准","bìng":"病","téng":"疼腾誊藤","liáng,liàng":"凉量","táng":"唐堂塘膛糖棠搪","pōu":"剖","chù,xù":"畜","páng,bàng":"旁磅","lǚ":"旅屡吕侣铝缕履","fěn":"粉","liào":"料镣","shāo":"烧","yān":"烟淹","tāo":"涛掏滔","lào":"涝酪","zhè":"浙蔗","xiāo":"消宵销萧硝箫嚣","hǎi":"海","zhǎng,zhàng":"涨","làng":"浪","rùn":"润闰","tàng":"烫","yǒng,chōng":"涌","huǐ":"悔毁","qiāo,qiǎo":"悄","hài":"害亥骇","jiā,jia,jie":"家","kuān":"宽","bīn":"宾滨彬缤濒","zhǎi":"窄","lǎng":"朗","dú,dòu":"读","zǎi":"宰","shàn,shān":"扇","shān,shàn":"苫","wà":"袜","xiáng":"祥翔","shuí":"谁","páo":"袍咆","bèi,pī":"被","tiáo,diào,zhōu":"调","yuān":"冤鸳渊","bō,bāo":"剥","ruò":"弱","péi":"陪培赔","niáng":"娘","tōng":"通","néng,nài":"能","nán,nàn,nuó":"难","sāng":"桑","pěng":"捧","dǔ":"堵赌睹","yǎn":"掩眼演衍","duī":"堆","pái,pǎi":"排","tuī":"推","jiào,jiāo":"教","lüè":"掠略","jù,jū":"据","kòng":"控","zhù,zhuó,zhe":"著","jūn,jùn":"菌","lè,lēi":"勒","méng":"萌盟檬朦","cài":"菜","tī":"梯踢剔","shāo,sào":"梢","fù,pì":"副","piào,piāo":"票","shuǎng":"爽","shèng,chéng":"盛","què,qiāo,qiǎo":"雀","xuě":"雪","chí,shi":"匙","xuán":"悬玄漩","mī,mí":"眯","la,lā":"啦","shé,yí":"蛇","lèi,léi,lěi":"累","zhǎn,chán":"崭","quān,juàn,juān":"圈","yín":"银吟淫","bèn":"笨","lóng,lǒng":"笼","mǐn":"敏皿闽悯","nín":"您","ǒu":"偶藕","tōu":"偷","piān":"偏篇翩","dé,děi,de":"得","jiǎ,jià":"假","pán":"盘","chuán":"船","cǎi":"彩睬踩","lǐng":"领","liǎn":"脸敛","māo,máo":"猫","měng":"猛锰","cāi":"猜","háo":"毫豪壕嚎","má":"麻","guǎn":"莞馆管","còu":"凑","hén":"痕","kāng":"康糠慷","xuán,xuàn":"旋","zhe,zhuó,zháo,zhāo":"着","lǜ,shuài":"率","gài,gě,hé":"盖","cū":"粗","lín,lìn":"淋","qú,jù":"渠","jiàn,jiān":"渐溅","hùn,hún":"混","pó":"婆","qíng":"情晴擎","cǎn":"惨","sù,xiǔ,xiù":"宿","yáo":"窑谣摇遥肴姚","móu":"谋","mì":"密蜜觅","huǎng":"谎恍幌","tán,dàn":"弹","suí":"随","yǐn,yìn":"隐","jǐng,gěng":"颈","shéng":"绳","qí":"骑棋旗歧祈脐畦崎鳍","chóu":"绸酬筹稠愁畴","lǜ,lù":"绿","dā":"搭","kuǎn":"款","tǎ":"塔","qū,cù":"趋","tí,dī,dǐ":"提","jiē,qì":"揭","xǐ":"喜徙","sōu":"搜艘","chā":"插","lǒu,lōu":"搂","qī,jī":"期","rě":"惹","sàn,sǎn":"散","dǒng":"董懂","gě,gé":"葛","pú":"葡菩蒲","zhāo,cháo":"朝","luò,là,lào":"落","kuí":"葵魁","bàng":"棒傍谤","yǐ,yī":"椅","sēn":"森","gùn,hùn":"棍","bī":"逼","zhí,shi":"殖","xià,shà":"厦","liè,liě":"裂","xióng":"雄熊","zàn":"暂赞","yǎ":"雅","chǎng":"敞","zhǎng":"掌","shǔ":"暑鼠薯黍蜀署曙","zuì":"最罪醉","hǎn":"喊罕","jǐng,yǐng":"景","lǎ":"喇","pēn,pèn":"喷","pǎo,páo":"跑","chuǎn":"喘","hē,hè,yè":"喝","hóu":"喉猴","pù,pū":"铺","hēi":"黑","guō":"锅郭","ruì":"锐瑞","duǎn":"短","é":"鹅额讹俄","děng":"等","kuāng":"匡筐","shuì":"税睡","zhù,zhú":"筑","shāi":"筛","dá,dā":"答","ào":"傲澳懊","pái":"牌徘","bǎo,bǔ,pù":"堡","ào,yù":"奥","fān,pān":"番","là,xī":"腊","huá":"猾滑","rán":"然燃","chán":"馋缠蝉","mán":"蛮馒","tòng":"痛","shàn":"善擅膳赡","zūn":"尊遵","pǔ":"普谱圃浦","gǎng,jiǎng":"港","céng,zēng":"曾","wēn":"温瘟","kě":"渴","zhā":"渣","duò":"惰舵跺","gài":"溉概丐钙","kuì":"愧","yú,tōu":"愉","wō":"窝蜗","cuàn":"窜篡","qún":"裙群","qiáng,qiǎng,jiàng":"强","shǔ,zhǔ":"属","zhōu,yù":"粥","sǎo":"嫂","huǎn":"缓","piàn":"骗","mō":"摸","shè,niè":"摄","tián,zhèn":"填","gǎo":"搞稿镐","suàn":"蒜算","méng,mēng,měng":"蒙","jìn,jīn":"禁","lóu":"楼娄","lài":"赖癞","lù,liù":"碌","pèng":"碰","léi":"雷","báo":"雹","dū":"督","nuǎn":"暖","xiē":"歇楔蝎","kuà":"跨胯","tiào,táo":"跳","é,yǐ":"蛾","sǎng":"嗓","qiǎn":"遣谴","cuò":"错挫措锉","ǎi":"矮蔼","shǎ":"傻","cuī":"催摧崔","tuǐ":"腿","chù":"触矗","jiě,jiè,xiè":"解","shù,shǔ,shuò":"数","mǎn":"满","liū,liù":"溜","gǔn":"滚","sāi,sài,sè":"塞","pì,bì":"辟","dié":"叠蝶谍碟","fèng,féng":"缝","qiáng":"墙","piě,piē":"撇","zhāi":"摘斋","shuāi":"摔","mó,mú":"模","bǎng,bàng":"榜","zhà":"榨乍诈","niàng":"酿","zāo":"遭糟","suān":"酸","shang,cháng":"裳","sòu":"嗽","là":"蜡辣","qiāo":"锹敲跷","zhuàn":"赚撰","wěn":"稳吻紊","bí":"鼻荸","mó":"膜魔馍摹蘑","xiān,xiǎn":"鲜","yí,nǐ":"疑","gāo,gào":"膏","zhē":"遮","duān":"端","màn":"漫慢曼幔","piāo,piào,piǎo":"漂","lòu":"漏陋","sài":"赛","nèn":"嫩","dèng":"凳邓瞪","suō,sù":"缩","qù,cù":"趣","sā,sǎ":"撒","tàng,tāng":"趟","chēng":"撑","zēng":"增憎","cáo":"槽曹","héng,hèng":"横","piāo":"飘","mán,mén":"瞒","tí":"题蹄啼","yǐng":"影颖","bào,pù":"暴","tà":"踏蹋","kào":"靠铐","pì":"僻屁譬","tǎng":"躺","dé":"德","mó,mā":"摩","shú":"熟秫赎","hú,hū,hù":"糊","pī,pǐ":"劈","cháo":"潮巢","cāo":"操糙","yàn,yān":"燕","diān":"颠掂","báo,bó,bò":"薄","cān":"餐","xǐng":"醒","zhěng":"整拯","zuǐ":"嘴","zèng":"赠","mó,mò":"磨","níng":"凝狞柠","jiǎo,zhuó":"缴","cā":"擦","cáng,zàng":"藏","fán,pó":"繁","bì,bei":"臂","bèng":"蹦泵","pān":"攀潘","chàn,zhàn":"颤","jiāng,qiáng":"疆","rǎng":"壤攘","jiáo,jué,jiào":"嚼","rǎng,rāng":"嚷","chǔn":"蠢","lù,lòu":"露","náng,nāng":"囊","dǎi":"歹","rǒng":"冗","hāng,bèn":"夯","āo,wā":"凹","féng,píng":"冯","yū":"迂淤","xū,yù":"吁","lèi,lē":"肋","kōu":"抠","lūn,lún":"抡","jiè,gài":"芥","xīn,xìn":"芯","chā,chà":"杈","xiāo,xiào":"肖","zhī,zī":"吱","ǒu,ōu,òu":"呕","nà,nè":"呐","qiàng,qiāng":"呛","tún,dùn":"囤","kēng,háng":"吭","shǔn":"吮","diàn,tián":"佃","sì,cì":"伺","zhǒu":"肘帚","diàn,tián,shèng":"甸","páo,bào":"刨","lìn":"吝赁躏","duì,ruì,yuè":"兑","zhuì":"坠缀赘","kē,kě":"坷","tuò,tà,zhí":"拓","fú,bì":"拂","nǐng,níng,nìng":"拧","ào,ǎo,niù":"拗","kē,hē":"苛","yān,yǎn":"奄","hē,a,kē":"呵","gā,kā":"咖","biǎn":"贬匾","jiǎo,yáo":"侥","chà,shā":"刹","āng":"肮","wèng":"瓮","nüè,yào":"疟","páng":"庞螃","máng,méng":"氓","gē,yì":"疙","jǔ,jù":"沮","zú,cù":"卒","nìng":"泞","chǒng":"宠","wǎn,yuān":"宛","mí,mǐ":"弥","qì,qiè,xiè":"契","xié,jiā":"挟","duò,duǒ":"垛","jiá":"荚颊","zhà,shān,shi,cè":"栅","bó,bèi":"勃","zhóu,zhòu":"轴","nüè":"虐","liē,liě,lié,lie":"咧","dǔn":"盹","xūn":"勋","yo,yō":"哟","mī":"咪","qiào,xiào":"俏","hóu,hòu":"侯","pēi":"胚","tāi":"胎","luán":"峦","sà":"飒萨","shuò":"烁","xuàn":"炫","píng,bǐng":"屏","nà,nuó":"娜","pá,bà":"耙","gěng":"埂耿梗","niè":"聂镊孽","mǎng":"莽","qī,xī":"栖","jiǎ,gǔ":"贾","chěng":"逞","pēng":"砰烹","láo,lào":"唠","bàng,bèng":"蚌","gōng,zhōng":"蚣","li,lǐ,lī":"哩","suō":"唆梭嗦","hēng":"哼","zāng":"赃","qiào":"峭窍撬","mǎo":"铆","ǎn":"俺","sǒng":"耸","juè,jué":"倔","yīn,yān,yǐn":"殷","guàng":"逛","něi":"馁","wō,guō":"涡","lào,luò":"烙","nuò":"诺懦糯","zhūn":"谆","niǎn,niē":"捻","qiā":"掐","yè,yē":"掖","chān,xiān,càn,shǎn":"掺","dǎn,shàn":"掸","fēi,fěi":"菲","qián,gān":"乾","shē":"奢赊","shuò,shí":"硕","luō,luó,luo":"啰","shá":"啥","hǔ,xià":"唬","tuò":"唾","bēng":"崩","dāng,chēng":"铛","xiǎn,xǐ":"铣","jiǎo,jiáo":"矫","tiáo":"笤","kuǐ,guī":"傀","xìn":"衅","dōu":"兜","jì,zhài":"祭","xiáo":"淆","tǎng,chǎng":"淌","chún,zhūn":"淳","shuàn":"涮","dāng":"裆","wèi,yù":"尉","duò,huī":"堕","chuò,chāo":"绰","bēng,běng,bèng":"绷","zōng,zèng":"综","zhuó,zuó":"琢","chuǎi,chuài,chuāi,tuán,zhuī":"揣","péng,bāng":"彭","chān":"搀","cuō":"搓","sāo":"搔","yē":"椰","zhuī,chuí":"椎","léng,lēng,líng":"棱","hān":"酣憨","sū":"酥","záo":"凿","qiào,qiáo":"翘","zhā,chā":"喳","bǒ":"跛","há,gé":"蛤","qiàn,kàn":"嵌","bāi":"掰","yān,ā":"腌","wàn":"腕","dūn,duì":"敦","kuì,huì":"溃","jiǒng":"窘","sāo,sǎo":"骚","pìn":"聘","bǎ":"靶","xuē":"靴薛","hāo":"蒿","léng":"楞","kǎi,jiē":"楷","pín,bīn":"频","zhuī":"锥","tuí":"颓","sāi":"腮","liú,liù":"馏","nì,niào":"溺","qǐn":"寝","luǒ":"裸","miù":"谬","jiǎo,chāo":"剿","áo,āo":"熬","niān":"蔫","màn,wàn":"蔓","chá,chā":"碴","xūn,xùn":"熏","tiǎn":"舔","sēng":"僧","da,dá":"瘩","guǎ":"寡","tuì,tùn":"褪","niǎn":"撵碾","liáo,liāo":"撩","cuō,zuǒ":"撮","ruǐ":"蕊","cháo,zhāo":"嘲","biē":"憋鳖","hēi,mò":"嘿","zhuàng,chuáng":"幢","jī,qǐ":"稽","lǒu":"篓","lǐn":"凛檩","biě,biē":"瘪","liáo,lào,lǎo":"潦","chéng,dèng":"澄","lèi,léi":"擂","piáo":"瓢","shà":"霎","mò,má":"蟆","qué":"瘸","liáo,liǎo":"燎","liào,liǎo":"瞭","sào,sāo":"臊","mí,méi":"糜","ái":"癌","tún":"臀","huò,huō,huá":"豁","pù,bào":"瀑","chuō":"戳","zǎn,cuán":"攒","cèng":"蹭","bò,bǒ":"簸","bó,bù":"簿","bìn":"鬓","suǐ":"髓","ráng":"瓤"};
					var hans,py,i=0;
					for(var py in pmap){
						hans = pmap[py];
						for(i=0;i<hans.length;i++){
							k.utils.pinyin.dict[hans[i]]=py;
						}
					}
				}
			},
			getSZM:function(han){
				//获取中文字段拼音首字母，超出3500常用字的用?填充，
				//含不同首字母多音字的，返回值前面加?
				k.utils.pinyin.init();
				var szm = '',zm,y0,zms;
				for(var i=0;i<han.length;i++){
					if(han[i].match(/^\w+$/i)){
						szm += han[i];
					}else if(zm = k.utils.pinyin.dict[han[i]]) {
				    	//暂时忽略多音节
//				    	if(zm.indexOf(',')) {
//				    		zms = zm.split(',');
//				    		for(var j=0;j<zms.length;j++){
//				    			if(zm[0] !== zms[j][0]) {
//				    				szm = '?'+szm;
//				    				break;
//				    			}
//				    		}
//				    	}
				    	y0 = k.utils.pinyin.yinbiao[zm[0]];
				    	szm += (y0?y0[0]:zm[0]);
				    }else{
				    	szm += '?';
				    }
				}
				return szm;
			}
		},
		extend:function(src,dist,cover){
			src = src || {};
			if(dist){
				for(var key in dist){
					if(cover || !src[key]){
						src[key] = dist[key];
					}
				}
			}
			return src;
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var md5 = (function(){
		var rotateLeft = function(lValue, iShiftBits) {
			return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
		}
		var addUnsigned = function(lX, lY) {
			var lX4, lY4, lX8, lY8, lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
			if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			if (lX4 | lY4) {
				if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		}
		var F = function(x, y, z) {
			return (x & y) | ((~ x) & z);
		}
		var G = function(x, y, z) {
			return (x & z) | (y & (~ z));
		}
		var H = function(x, y, z) {
			return (x ^ y ^ z);
		}
		var I = function(x, y, z) {
			return (y ^ (x | (~ z)));
		}
		var FF = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var GG = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var HH = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var II = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var convertToWordArray = function(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWordsTempOne = lMessageLength + 8;
			var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
			var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
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
		var wordToHex = function(lValue) {
			var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
			for (lCount = 0; lCount <= 3; lCount++) {
				lByte = (lValue >>> (lCount * 8)) & 255;
				WordToHexValueTemp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
			}
			return WordToHexValue;
		};
		var uTF8Encode = function(string) {
			string = string.replace(/\x0d\x0a/g, "\x0a");
			var output = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					output += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					output += String.fromCharCode((c >> 6) | 192);
					output += String.fromCharCode((c & 63) | 128);
				} else {
					output += String.fromCharCode((c >> 12) | 224);
					output += String.fromCharCode(((c >> 6) & 63) | 128);
					output += String.fromCharCode((c & 63) | 128);
				}
			}
			return output;
		};
		return function(string) {
				var x = Array();
				var k, AA, BB, CC, DD, a, b, c, d;
				var S11=7, S12=12, S13=17, S14=22;
				var S21=5, S22=9 , S23=14, S24=20;
				var S31=4, S32=11, S33=16, S34=23;
				var S41=6, S42=10, S43=15, S44=21;
				string = uTF8Encode(string);
				x = convertToWordArray(string);
				a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
				for (k = 0; k < x.length; k += 16) {
					AA = a; BB = b; CC = c; DD = d;
					a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
					d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
					c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
					b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
					a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
					d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
					c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
					b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
					a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
					d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
					c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
					b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
					a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
					d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
					c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
					b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
					a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
					d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
					c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
					b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
					a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
					d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
					c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
					b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
					a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
					d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
					c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
					b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
					a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
					d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
					c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
					b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
					a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
					d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
					c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
					b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
					a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
					d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
					c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
					b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
					a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
					d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
					c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
					b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
					a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
					d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
					c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
					b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
					a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
					d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
					c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
					b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
					a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
					d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
					c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
					b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
					a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
					d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
					c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
					b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
					a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
					d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
					c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
					b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
					a = addUnsigned(a, AA);
					b = addUnsigned(b, BB);
					c = addUnsigned(c, CC);
					d = addUnsigned(d, DD);
				}
				var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
				return tempValue.toLowerCase();
			}
	})();
	k.safe={
		local_pwd:function(pwd){
			return md5(md5(pwd)+pwd);
		},
		up_pwd:function(local,pwd){
			return md5(local+pwd);
		},
	}
})(window.kaidanbao);
/** http://usejsdoc.org/
 */
(function(k){
	k.conf={appName:'kaidanbao'}//全局变量名称，window.kaidanbao
	k.conf.shuzi_quan=['〇','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
	k.conf.shuzi_roma=['〇','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ'];
})(window.kaidanbao);/**
 * 静态表数据的完整缓存，可直接使用
 */
(function(k){
	var u=k.utils;
	var fixed={},					//所有 f 记录均缓存
		local,//本地存储
		fixed_by_table={			//分表格存储id
			setup:[],clerk:[],customer:[],supplier:[],account:[],product:[],
		},
		name_cache={
			customer:{},
			product:'', //产品名字可以重复
			supplier:{},
			clerk:{},
			account:{},
			repository:{}
		},
		fixed_page={   //固定表页面缓存
			customer:[],supplier:[],account:[],product:[],clerk:[],
		},
		dynamic_page={},//动态表页面缓存，每个表保存一个月的缓存，k.dao使用
		setup={},//分类{a0:{},a2:{},...,b0:{},b1:{}}
		sign={   //登录参数，
//			user_id   :0,		//当前本地库所属用户id
//			staff_id  :0,	    //当前登录的客户staffid
//			box_id  :0,		    //当前本地数据库序号，用户用户记录id前缀@k.dao.getId()
//			need_create_db  :0, //是否需要新建数据库
//			month_length:0,		//用户从注册到目前的月份数
//			session:{token,usb},//会话信息
//			user:{}  //客户信息，含用户列表
//			loaded:false,//已登录且loading完成
		},
		dates={//相关时间常量
			m_t: [], //['2016-09','2016-08','2016-07',...]
			m_t_map:{},//{'2016-09':0,'2016-08':1,'2016-07':2,...}
			mt : [],//['1609','1608','1607',...]
			mt_map:{},//{'1609':0,'1608':1,'1607':2,...}
			mi : [new Date().getMonth()],//月份序号，Date().getMonth()对应m_t下标
			mts: [], //[1476360544555,1476360546422,...]对应m_t每个月的开始时间戳
			mts_max:2548944000000, //2050/10/10
		},
		sys={   //系统参数,需要持久化到本地库，用于同步控制，离线识别，每次登陆后全部加载
//			index_id:0,		  //当前用户记录id后缀序号@k.dao.getId()
//			syn_fixed_last_time :0, //最后静态表同步时间戳
//			syn_dynamic_last_time :0, //最后动态表同步时间戳
		};
	k.cache={
		fixed:fixed,name_cache:name_cache,dynamic:dynamic_page,fixed_page:fixed_page,
		sign:sign,dates:dates,sys:sys,
		local:function(val){
			if(val){
				local = val;
				localStorage.setItem('k',JSON.stringify(val));
			}else {
				if(localStorage['k']){
					if(val === '') localStorage.removeItem('k');
					if(!local) local = JSON.parse(localStorage['k']);
				}
				return local || {};
			}
//			localStorage.clear();
		},
		setup:function(type){
			return fixed['i'+setup[type]] || '';
		},
		get:function(id){return fixed['i'+id] || ''},//防止undefine
		put:function(value,fupd){
			if(value.tp === 'f'){
				if(fupd) u.extend(fixed['i'+value._id],value,true); 
				else fixed['i'+value._id] = value;
				if(name_cache[value.tn] && value.name) name_cache[value.tn][value.name]=value._id;
				if(fixed_by_table[value.tn]) fixed_by_table[value.tn].unshift(value._id);
				if(fixed_page[value.tn]) fixed_page[value.tn].unshift(value._id);
			}
			if(fupd) fupd();
		},
		fixed_by_table:fixed_by_table,
		init:function(comp){
			//初始化时间常量
			dates.m_t = k.utils.date.get_before_yms(15);
			for(var n in dates.m_t){
				n = parseInt(n);
				dates.mt.push(dates.m_t[n].substr(2).replace('-',''));
				dates.m_t_map[dates.m_t[n]] = n;
				dates.mt_map[dates.mt[n]] = n;
				if(dates.mi[n]==0) dates.mi[n+1] = 11;
				else dates.mi[n+1] = dates.mi[n]-1;
				dates.mts.push(new Date(dates.m_t[n].replace('-','/')+'/1').getTime());
			}
			sign.month_length = Math.ceil((new Date().getTime()-sign.user.ct)/2629800000);
			k.dao.queryAllFixed(function(err,r){
				if(r){
					fixed['i'+r._id] = r;
					if(fixed_by_table[r.tn]) fixed_by_table[r.tn].push(r._id);
					if(fixed_page[r.tn]) fixed_page[r.tn].push(r._id);
					if(name_cache[r.tn] && r.name) name_cache[r.tn][r.name]=r._id;
				}else{
					var value,i;
					for(i in fixed_by_table['setup']){
						value = fixed['i'+fixed_by_table['setup'][i]];
						setup[value.type]=value._id;
					}
					if(!setup.roll){//插入角色字段
						k.dao.addOne(k.conf.preinsert.roll,function(err,r){
							setup.roll=r._id;
						});
					}
					if(!setup.classify){//插入分类字段
						k.dao.addOne(k.conf.preinsert.classify,function(err,r){
							setup.classify=r._id;
						});
					}
					if(!setup.setting){//插入设置字段
						k.dao.addOne(k.conf.preinsert.setting,function(err,r){
							setup.setting=r._id;
						});
					}
					if(fixed_by_table.account.length==0){//插入现金账号
						k.dao.addOne(k.conf.preinsert.xianjin);
					}
					comp();
				}
			});
		},
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 * 
 * 遵循如下原则：
 * 保存模型：1缓存->2本地库->3上传库->4网络云端
 * 静态数据全部缓存，尽量使用缓存操作。动态数据全部不缓存
 * 
 * 仅支持以下两种查询
 * 1，启动时，查询所有静态表数据
 * 2，按表名-时间查询动态记录
 * 
 * 支持以下两种变动
 * 1，添加一条记录
 * 2，更新一条记录（删除）
 * 
 */
(function(k){
	var u = k.utils;
	var db,db_upd;
//=================================数据库增删改查=====================================
	//获取
	var get=function(table,id,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.get(id).onsuccess=function(v){
		      if(comp) {comp(v.target.result); }
		    };
		});
	};
	//计数
	var count=function(table,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.count().onsuccess=function(v){
				if(comp) {comp(v.target.result); }
			};
		});
	};
	//删除
	var del=function(table,id,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e['delete'](id).onsuccess=function(v){
				if(comp) comp(v.target.result);
			};
		});
	}
	//新增,
	var add=function(table,value,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.add(value).onsuccess=function(r){
				//e.target.result 是id
				if(comp) {comp(r.target.result); }
			};
		});
	};
	//新增/修改，put
	var put=function(table,value,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.put(value).onsuccess=function(r){
				//e.target.result 是id
				if(comp) {comp(r.target.result); }
			};
		});
	};
	//更新
	var upd=function(table,value,comp,upset,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.get(value._id).onsuccess=function(v){
				var r=v.target.result;
				if(r){
					u.extend(r,value,true);
					put(table,r,function(){
						if(comp) {comp(r); }
					},upddb);
				}else if(upset){
					add(table,value,function(){
						if(comp) {comp(value); }
					},upddb);
				}else{
					if(comp) {comp(); }
				}
				
			};
		});
	};
	//条件查询
//	var getArray=function(table,index,value,comp){
//	  db.doTransaction(table,function(e){
//		  var ind,range=null,r; //从存储对象中获取索引对象
//		  if(index) {ind=e.index(index); }
//		  else {ind = e; }
////		  IDBKeyRange.lowerBound(any,bool)
////		  IDBKeyRange.upperBound(any,bool)
////		  IDBKeyRange.bound(any,any,bool,bool)
////		  IDBKeyRange.only(any)
//		  if(value) {range=IDBKeyRange.bound(value[0],value[1],true,true); }
//		  //从索引对象中遍历数据[next,prev]
//		  ind.openCursor(range,'prev').onsuccess=function(e){
//		    r=e.target.result;
//		    if(r){
//				comp(null,r.value);
//				r['continue']();
//			}else{
//				comp(true,null);
//			}
//		  };
//	  });
//	};
//==================================打开数据库==================================
	if(k.cache.sign.need_create_db){
		indexedDB.deleteDatabase(k.conf.db.name+k.cache.sign.user_id);//删除旧库
	}
	var openDB = function(comp){
		var cn=indexedDB.open(k.conf.db.name+k.cache.sign.user_id,1);
		cn.onupgradeneeded=function(e){
		  db=e.target.result;
		  db.createObjectStore('fixed_table',{keyPath:'_id'}).createIndex('lm','lm');
		  db.createObjectStore('salebill',{keyPath:'_id'}).createIndex('ct','ct'); //销售单
		  db.createObjectStore('bringbill',{keyPath:'_id'}).createIndex('ct','ct');//采购单
		  db.createObjectStore('checkbill',{keyPath:'_id'}).createIndex('ct','ct');//盘点单
		  db.createObjectStore('productbill',{keyPath:'_id'}).createIndex('ct','ct');//生产单
		  db.createObjectStore('moneyflow',{keyPath:'_id'}).createIndex('ct','ct');//资金流水
		  db.createObjectStore('manuals',{keyPath:'_id'}).createIndex('ct','ct');//使用手册、常见问题、我的提问、单独使用，不在同步体系
		  db.createObjectStore('log',{keyPath:'_id'}).createIndex('ct','ct');//操作日志，存本地不上传
		  db.createObjectStore('sys',{keyPath:'id'});//sys_table
		};
		cn.onsuccess=function(e){
			db=e.target.result;
			db.doTransaction=function(t,f){
				var ta=db.transaction(t,"readwrite");
				ta.onerror=function(){}; //TODO handle error
				f(ta.objectStore(t));
			};
			//upddb
			var cn_upd=indexedDB.open(k.conf.db.name+'upd'+k.cache.sign.user_id,1);
			cn_upd.onupgradeneeded=function(e){
				db_upd=e.target.result;
				db_upd.createObjectStore('upd',{keyPath:'_id'});
			};
			cn_upd.onsuccess=function(e){
				db_upd=e.target.result;
				db_upd.doTransaction=function(t,f){
					var ta=db_upd.transaction(t,"readwrite");
					ta.onerror=function(){}; //TODO handle error
					f(ta.objectStore(t));
				};
				comp();
			};
		};
	};
//==================================内部方法==================================
	var id_count=0,first_get_id=true;
	var getId=function(n,comp){
		var r = [],i;id_count+=n;
		for(i=0;i<n;i++){ r.push(k.cache.sign.box_id*1000000+(++k.cache.sys.index_id)); }
		if(first_get_id){
			id_count += 7;
			first_get_id = false;
		}
		if(id_count > 7){
			put('sys',{id:'index_id',value:k.cache.sys.index_id+id_count},function(){
				id_count = 0;
				comp(r);
			});
		}else{
			comp(r);
		}
	};
// =================================================================
	k.dao = {
		get:get,
		add:add,
		put:put,
		upd:upd,
		count:count,
		delupddb:function(id){
			del('upd',id,null,1);
		},
		clearupddb:function(){
			db_upd.doTransaction('upd',function(e){
				e.clear();
			});
		},
		/**新增一条记录
		 * @value 记录
		 * @conp 回调函数
		 * @model 1缓存->2本地库->3上传库->4网络云端(默认)
		 */
		addOne:function(value,comp,model){
			k.cache.dynamic[value.tn]=null;
			value.ui=k.cache.sign.user_id;
			value.si=k.cache.sign.staff_id;
			value.ct=u.date.getNow();
			value.lm=value.ct;
			value.tp=k.conf.table[value.tn]._tp;
			getId(1,function(ids){
				value._id=ids[0];
				if(model === 1){
					k.cache.put(value);
					if(comp) comp(false,value);
				}else if(model === 2){
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id) k.cache.put(value);
						if(comp) {comp(!id,value); }
					});
				}else if(model === 3){
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id){
							add('upd',value,function(id2){
								if(id2) k.cache.put(value);
								else del(value.tp==='f'?'fixed_table':value.tn,id);
								if(comp) comp(!id2,value);
							},1);
						}else if(comp) comp(true,value);
					});
				}else {
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id){
							k.cache.put(value);
							add('upd',value,null,1);
							k.net.api('/user/addOne',value,function(err){
								if(err){
								}else{
									del('upd',id,null,1);
								}
							});
						}
						if(comp) {comp(!id,value); }
					});
				}
			});
		},
		/**更新一条记录
		 * @value 更新字段集合
		 * @conp 回调函数
		 * @model 1缓存->2本地库->3上传库->4网络云端(默认)
		 */
		updOne:function(value,comp,model){
			if(value.tn) k.cache.dynamic[value.tn]=null;
			value.lm=u.date.getNow();
			value.tp= k.conf.table[value.tn]._tp;
			var table = (value.tp==='f'?'fixed_table':value.tn);
//			delete value.tn;
			//1静态记录缓存更新
			if(model===1) {
				k.cache.put(value,function(v1){if(comp) comp(false,v1);});
			}else if(model === 2){
				upd(table,value,function(v2){
					if(v2) k.cache.put(v2);
					if(comp) {comp(!v2,v2); }
				});
			}else if(model === 3){
				upd(table,value,function(v3){
					if(v3){
						k.cache.put(v3);
						upd('upd',value,function(v){
							if(comp) comp(!v,v3);
						},true,1);
					}else if(comp) {comp(true,v3); }
				});
			}else{
				upd(table,value,function(v4){
					if(v4){
						k.cache.put(v4);
						upd('upd',value,function(v){
							k.net.api('/user/updOne',v,function(err){
								if(err){
								}else{
									del('upd',v._id,null,1);
								}
							});
							if(comp) {comp(!v,v4); }
						},true,1);
					}else if(comp) {comp(true,v4); }
				});
			}
		},
		/**添加多条记录（使用addOne再upl）无cache */
//		addMany:function(values,comp){
//			var now=u.date.getNow(),s1=0,s2=0,
//				i,c1=0,c2=0,len=values.length;
//			getId(len,function(ids){
//				for(i in values){
//					values[i]._id=ids[i];
//					values[i].ui=k.conf.sign.user_id;
//					values[i].si=k.conf.sign.staff_id;
//					values[i].ct=now;
//					values[i].lm=now;
//					values[i].tp = k.conf.table[values[i].tn]._tp;
//					add('upddb',values[i],function(id1){
//						if(id1) s1++;
//						if(++c1 === len){ k.syn.upl(); }
//					});
//				    add(values[i].tp==='f'?'fixed_table':values[i].tn,values[i],function(id2){
//				    	if(id2) s2++;
//				    	if(++c2 === len){//complete
//				    		if(comp) comp();
//				    	}
//				    });
//				}
//			});
//		},
		queryAllFixed : function(comp) {
			db.doTransaction('fixed_table', function(e) {
				var r; // 从存储对象中获取索引对象
				e.index('lm').openCursor(null, 'prev').onsuccess = function(e) {
					r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true, null);
					}
				};
			});
		},
		/** @month YYYY-MM */
		queryDynamicByMonth : function(table, month, comp,sort) {
			var table_cache=k.cache.dynamic[table];
			if(table_cache && table_cache[month]) {
				comp(true);
			}else{
				k.cache.dynamic[table] = {};
				var m = k.cache.dates.m_t_map[month],arr=[];
				var start = k.cache.dates.mts[m],end = k.cache.dates.mts_max;
				if(m > 0) end = k.cache.dates.mts[m-1];
				var range = IDBKeyRange.bound(start, end, true, false);
				db.doTransaction(table,function(e) {
					e.index('ct').openCursor(range, (sort || 'prev')).onsuccess = function(e){
						var r = e.target.result; // 从存储对象中获取索引对象
						if (r) {
							arr.push(r.value);
							comp(null, r.value);
							r['continue']();
						} else {
							k.cache.dynamic[table][month]=arr;
							comp(true);
						}
					};
				});
			}
		},
		/** @table upddb or sys */
		queryAll : function(table, comp,upddb) {
			var mydb = upddb?db_upd:db;
			mydb.doTransaction(table, function(e) {
				var r; // 从存储对象中获取索引对象
				e.openCursor().onsuccess = function(e) {
					r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true, null);
					}
				};
			});
		},
		del:function(table,id,comp){
			k.dao.updOne({_id:id,tn:table,st:'d'},comp);
		},
		init:function(comp){
			openDB(function(){
				comp();
			});
		}
	};
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 * 为了方便，快捷，仅能保证99.9%的一致性，如下情况可能导致不一致：
 * 1，离线使用后，未通过在线登陆上传数据
{"ln":"13702307103","dbv":20161022,"ll13702307103":1478176819793,"lp13702307103":"0b9033f6122972a588cd2b41e11dedce","ui13702307103":21,"si13702307103":1,"bi13702307103":103}
 */
(function(k){
	var u = k.utils;
	var upl = function(comp){
		var ups = [];
		k.dao.queryAll('upd',function(finish,v){
			if(finish){
				if(ups.length > 0){
					k.net.api('/user/upl',ups,function(err,r){
						if(err){
						}else{
							if(r.obj.all){
								k.dao.clearupddb();
							}else{
								for(var i in r.obj.ids){
									k.dao.delupddb(r.obj.ids[i]);
								}
							}
						}
						if(comp) comp(err,r);
					});
				}else if(comp) comp(true);
			}else{
				ups.push(v);
			}
		},1);
	}
	var down=function(type,after,before,comp){
		k.net.api('/user/down',{ui:k.cache.sign.user_id,tp:type,before:before,after:after},function(err,r){
			if(err){
				comp(err,null);
			}else{
				for(var i in r.obj){
					k.dao.put(type==='f'?'fixed_table':r.obj[i].tn,r.obj[i]);
				}
				comp(null,r);
			}
		});
	}
	k.syn={
		upl:upl,
		down:down,
		init:function(comp){
			if(k.cache.sign.need_create_db){
				/** 本次新建数据库 */
				if(k.cache.sign.user) k.dao.put('sys',{id:'user',value:k.cache.sign.user});
				k.cache.sys.index_id=0;
				k.cache.sys.syn_fixed_last_time=0;
				k.cache.sys.syn_dynamic_last_time=0;
				
				var now = u.date.getNow();
				down('f',0,0,function(err,r){
					if(err){//下载失败f
					}else{
						k.cache.sys.syn_fixed_last_time = now;
						k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
						now = u.date.getNow();
						down('d',k.cache.dates.mts[2],0,function(err1,r1){
							if(err1){//下载失败d
							}else{
								k.cache.sys.syn_dynamic_last_time = now;
								k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
								comp();
							}
						});
					}
				});
			}else{
				/** 再次登录 */
				k.dao.queryAll('sys',function(err,r){
					if(r){
						k.cache.sys[r.id] = r.value;
					}else{
						if(k.cache.sign.user){
							k.dao.put('sys',{id:'user',value:k.cache.sign.user});
						}else k.cache.sign.user = k.cache.sys.user;
						k.cache.sys.index_id              = k.cache.sys.index_id              || 0;
						k.cache.sys.syn_fixed_last_time   = k.cache.sys.syn_fixed_last_time   || 0;
						k.cache.sys.syn_dynamic_last_time = k.cache.sys.syn_dynamic_last_time || 0;
						if(k.cache.sign.session){  //与服务器同步数据
							upl(function(){  //先上传，再下载
								var now = u.date.getNow();
								down('f',k.cache.sys.syn_fixed_last_time,0,function(err,r){
									if(err){//下载失败f
									}else{
										k.cache.sys.syn_fixed_last_time = now;
										k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
									}
									now = u.date.getNow();
									down('d',k.cache.sys.syn_dynamic_last_time,0,function(err1,r1){
										if(err1){//下载失败d
										}else{
											k.cache.sys.syn_dynamic_last_time = now;
											k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
										}
										comp();
									});
								});
							});
						}else comp();
					}
				});
			}
		},
		sse:function(){//server send event
			var sse =new EventSource('/event/sse?'+k.cache.sign.session.usb);
			sse.onmessage=function(e){//{t:类型,v:值,end:是否结束}
				console.log('<li>'+ e.data +'</li> - '+u.date.getTimeFormat(0,'dt'));
//				var msg=JSON.parse(e.data);
//				if(msg.t==='logout'){
//					//用户下线
//				}else if(msg.t==='login'){
//					//用户上线
//				}else if(msg.t==='signout'){
//					//退出登录
//				}else if(msg.t==='addOne'){
//					//添加一条记录
//				}else if(msg.t==='updOne'){
//					//更新一条记录
//				}else if(msg.t==='upl'){
//					//上载一条记录
//					if(msg.end){
//						//上载结束
//					}
//				}else if(msg.t==='print'){
//					//远程打印
//				}else{
//					//其他
//				}
			}
			sse.onerror=function(){
				console.log('sse err , close'+u.date.getTimeFormat(0,'dt'));
				sse.close();
			}
		}
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var timer;
	k.aspect={
		/** 组件提示，消息，弹框，进度
		 */
		noty:{
			message:function(msg){
				if(timer) clearTimeout(timer);
				$('.noty.message').remove();
				$('body').append('<div class="noty message">'+msg+'</div>');
				timer = setTimeout(function() {
					$('.noty.message').remove();
				}, 2000);
			},
			confirm:function(msg,comp,only_sure,timeout,width){//单位：秒
//				$('div.noty.confirm button.cancel').click();
				$('body').append(' \
						<div id="confirm-mask"><progress style="width:100%;height:3%;"></progress></div> \
						<div class="noty confirm"> \
						  <div>'+(msg || '请确认！')+'<br /><br /> \
							  <button class="ensure">确定</button> \
							  <button class="cancel" style="color:#f08;margin-left:5px;">取消</button> \
						  </div> \
						</div>');
				$('div.noty.confirm>div').css('width',width || '450px');
				var inter;
				if(timeout){//超时关闭的进度条
					var val = timeout * 25;
					$('#confirm-mask progress').attr('max',val).attr('value',val);
					inter = setInterval(function(){
						$('#confirm-mask progress').attr('value',--val);
						if(val < 1) {
							clearInterval(inter);
							$('div.noty.confirm button.cancel').click();
						}
					},40);
				}else $('#confirm-mask progress').remove();
				$('div.noty.confirm button.ensure').click(comp);
				$('div.noty.confirm button.cancel').click(function(){
					if(inter) clearInterval(inter);
					$('div.noty.confirm').remove();
					$('#confirm-mask').remove();
				});
				if(only_sure){
					$('div.noty.confirm button.cancel').attr('hidden','hidden');
				}
			},
			confirm_close:function(){
				$('div.noty.confirm button.cancel').click();
			},
			progress:function(msg){
				$('body').append('<div class="noty progress">'+(msg || '正在处理，请稍候...')+'<br /><br /><progress></progress></div>');
			},
			close_progress:function(){
				$('div.noty.progress').remove();
			}
		},
		pay:function(conf,comp){
			var h1=(conf.title || '微信扫码支付')+' - ￥'+(conf.price || 288);
			k.aspect.noty.confirm('<h1>'+h1+'</h1><br /> \
					<img src="/image/vx.jpg" style="width:301px;"><br /> \
					<input placeholder="序列号 XXXX-XXXX-XXXX" spellcheck="false" class="cdkey" style="width:320px;" />',
			function(){
				var cdkey = $('div.noty.confirm input.cdkey').val().trim();
				if(!/^[A-Z]{4}-[A-Z]{4}-[A-Z]{4}$/.test(cdkey)){
					k.aspect.noty.message('序列号不对，请检查！');
					return;
				}
				conf.param.cdkey=cdkey;
				k.aspect.noty.progress('操作中。。。');
				k.net.api(conf.url,conf.param,function(err,r){
					k.aspect.noty.close_progress();
					if(err) k.aspect.noty.message('操作失败！');
					else comp(r);
				},conf.no_session);
			},false,300);
		},
	}
})(window.kaidanbao);
/**
 * 页面框架
 */
(function(k){
	//文档加载结束，基于url HASH执行函数，保证最终HASH不低于二级
	var oldHash='#/sign/nothing',
		defaultHash = '#/sign/login',
		urlHashMap={'#/sign/login':1,'#/sign/register':1,'#/sign/forget':1,'#/sign/loading':1},
		secondHash={'#/sign':'login'};
	k.frame={
		current_plugin:'',	//当前页面
		init:function(){
			if(!document.getElementById('print')){
				$('body').append('<div id="print"><div class="print"></div></div>');
			}
			if(!document.getElementById('export')){
				$('body').append('<div id="export"></div><input type="file" id="importfile" hidden accept="application/vnd.ms-excel" onchange="kaidanbao.plugin.store.import_check(this.files[0])">');
			}
			if(!document.getElementById('layout')){
				$('body').append('<div hidden id="layout"><div class="lay-main"></div></div>');
			}
			$('#layout').append('<div class="lay-top"><ul></ul></div>');
			if($('#layout  div.lay-main').length===0){
				$('#layout').append('<div class="lay-main"></div>');
			}
			var json = k.conf.frame;
			//json['p'][m]['sol'][n]['plug'][l]
			var p=json['p'],sol,plug,i,j,m,en,cn;
			for(i=0;i<p.length;i++){
				if(p[i]['sol'].length === 0) continue;
				en=p[i]['en'];cn=p[i]['cn'];
				secondHash['#/'+en]=p[i]['sol'][0]['plug'][0]['en'];
				$('#layout').append('<div hidden class="lay-left '+en+'"></div>');
				$('#layout div.lay-top ul').append('<li class="'+en+'"><a href="#/'+en+'">'+cn+'</a></li>');
				sol = p[i]['sol'];
				for(j=0;j<sol.length;j++){
					$('#layout div.'+en).append('<h2>'+sol[j]['cn']+'</h2><ul class="'+sol[j]['en']+'"></ul>');
					plug=sol[j]['plug'];
					for(m=0;m<plug.length;m++){
						$('#layout div.'+en+' ul.'+sol[j]['en']).append(
							'<li class="'+plug[m]['en']+'"><a href="#/'+en+'/'+plug[m]['en']+'">'+plug[m]['cn']+'</a></li>');
						urlHashMap['#/'+en+'/'+plug[m]['en']]=1;
					}
				}
			}
			k.frame.hashchangeHandle();
		},
		hashchangeHandle : function(){
			var newHashArr,oldHashArr;
			var newHash = window.location.hash;
			
			if(oldHash===newHash) return;
			
			//只能通过'#/sign/login'进入'#/sign/loading'
			if(newHash==='#/sign/loading' && oldHash!=='#/sign/login'){
				location.href = './';
				return;
			}
			if(newHash){
				if(secondHash[newHash]){
					location.replace(newHash+'/'+secondHash[newHash])
					return;
				}
				if(urlHashMap[newHash]){
					newHashArr = newHash.split('/');
					oldHashArr = oldHash.split('/');
					secondHash['#/'+newHashArr[1]] = newHashArr[2];
					
					//sign只能通过'#/sign/loading'进入非sign
					if(newHashArr[1] !== 'sign' && oldHashArr[1]==='sign' && oldHashArr[2]!=='loading'){
						location.href = './';
						return;
					}
//					k.conf.sign.plug_name=newHashArr[2];
					k.frame.current_plugin=newHashArr[2];
					k.plugin._change(oldHashArr,newHashArr);
					k.frame._change(oldHashArr,newHashArr);
					
					oldHash = newHash;
				}else{
					location.href = './';
				}
			}else{
				location.replace(defaultHash)
			}
		},
		_change:function(oldHashArr,newHashArr) {
			if(newHashArr[1] === 'sign' && oldHashArr[1] === 'sign'){
				//TODO 样式测试用
//				$('#sign .sign-button-login button').click();
				if(newHashArr[2] === 'loading'){
					$('#sign .sign-main').attr('hidden','hidden');
					$('#sign .sign-loading').removeAttr('hidden');
				}else{
					$('#sign .sign-input-wrapper,#sign .sign-button-wrapper,#sign .sign-a-wrapper div').attr('hidden','hidden');
					$('#sign .sign-input-password,#sign .sign-input-loginname').removeAttr('hidden');
					$('#sign .sign-a-wrapper div').css('float','left');
					if(newHashArr[2] === 'login'){
						$('#sign .sign-button-login,#sign .sign-a-wrapper div.register,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'register'){
						$('#sign .sign-input-inc,#sign .sign-button-register,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'forget'){
						$('#sign .sign-input-captcha,#sign .sign-button-forget,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.register').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.register').css('float','right');
					}
				}
			}else{
				if(oldHashArr[1] === 'sign'){
					$('#sign').attr('hidden','hidden');
					$('#layout').removeAttr('hidden');
					$('#layout div.'+newHashArr[1]).removeAttr('hidden');
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}else{
					if(oldHashArr[1] === newHashArr[1]){
						$('#layout div.'+oldHashArr[1]+' li.'+oldHashArr[2]).removeClass('selected');
					}else{
						$('#layout div.'+oldHashArr[1]).attr('hidden','hidden');
						$('#layout div.'+newHashArr[1]).removeAttr('hidden');
						$('#layout div.lay-top li.'+oldHashArr[1]).removeClass('selected');
						$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					}
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-main div.'+oldHashArr[2]).attr('hidden','hidden');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}
			}
		},	
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	k.plugin={
		_initedCache:{},
		_change:function(oldHashArr,newHashArr) {
			var oldname = oldHashArr[2];//释放旧页面
			if(k.plugin[oldname] && k.plugin[oldname].release)  k.plugin[oldname].release();
			
			var newname = newHashArr[2];
			if(k.plugin._initedCache[newname]){
				k.plugin._initedCache[newname] += 1;
				//重新加载新页面
				if(k.plugin[newname] && k.plugin[newname].reload)  k.plugin[newname].reload();
			}else{
				k.plugin._initedCache[newname]=1;
//				console.log(oldHashArr,newHashArr);
				//初始化新页面
				if(k.plugin[newname] && k.plugin[newname].init) k.plugin[newname].init();
			}
		}
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var ajax = function(conf, comp, prgr) {
	    // 默认配置
		u.extend(conf, {
	        url :'/default/path',
	        method : 'POST',
	        timeout : 30000,
	    });
		$.ajax({ 
			url: conf.url+'?'+new Date().getTime(),
			type : conf.method,
			timeout:conf.timeout,
			data:conf.data?JSON.stringify(conf.data):null,
			complete:function(xhr,ts){
				if (xhr.status === 200) {
	            	comp(null,JSON.parse(xhr.responseText));
	            } else {
	                comp(xhr);
	            }
			},
		});
	}
	k.net={
		api:function(api_path,param,comp,do_not_need_session){
			if(do_not_need_session || k.cache.sign.session){
				ajax({url:api_path,data:{s:k.cache.sign.session || {},p:param}},function(err,r){
					if(err){
						comp(err);
					}else if(r.code === 200){
						comp(null,r);
					}else{
						comp(r);
						if(r.msg) k.aspect.noty.message(r.msg);
					}
				});
			}else comp({msg:'no session'});
		},
	}
})(window.kaidanbao);
/** http://usejsdoc.org/
 */
(function(k){
	k.conf.db={
		name:'kdb',
	}
	//数据库表定义 setup monthly customer product supplier clerk account repository
	k.conf.table={
		setup:{ _tp : 'f', cn : '设置',cols : {type:'',value:'',}},//默认设置，分类，枚举
		
		product:{ _tp : 'f', cn : '产品',nav:'sale',cols : {number: '编号',name: '名称',spec: '规格',unit: '单位',price: '售价',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'spec':' ','price':' ','number':' ','name':' ','ct':' ','lm':'asc'}},
		customer:{ _tp : 'f',py:true, cn : '客户',nav:'sale',cols : {number: '编号',name:'名称',address:'地址',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		supplier:{ _tp : 'f',py:true, cn : '供应商',nav:'sale',cols : {number: '编号',name:'名称',address:'地址',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		clerk:{ _tp : 'f',py:true, cn : '职员',nav:'sale',cols : {number: '工号',name: '姓名',tel: '电话',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		account:{ _tp : 'f', cn : '账户',nav:'fi',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
//		repository:{ _tp : 'f', cn : '仓库',nav:'stock',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
		
		salebill:{ _tp : 'd', cn : '销售单',nav:'sale',cols : {ct:'单号',customer_id: '客户',saler_id: '销售员',amount: '金额',payamount:'定金',product:'商品',p_spec:'规格',count:'数量',price:'单价'},sort:{'customer_id':' ','saler_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		bringbill:{ _tp : 'd', cn : '采购单',nav:'sale',cols : {ct:'单号',supplier_id: '供应商',buyer_id: '采购员',amount: '金额',payamount:'首付',product:'商品',p_spec:'规格',count:'数量',price:'单价'},sort:{'supplier_id':' ','buyer_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		allotbill:{ _tp : 'd', cn : '调拨单',nav:'stock',cols : {number:'单号',alloter_id: '调拨员',callout:'调出仓库',callin:'调入仓库',}},
		pplanbill:{ _tp : 'd', cn : '生产单',nav:'stock',cols : {number:'单号',planer_id: '计划员',pmer:'负责人',repository:'仓库',progress:'生产进度'}},
		checkbill:{ _tp : 'd', cn : '盘点单',nav:'stock',cols : {number:'单号',customer_id: '客户',date: '日期',amount: '金额',saler_id: '销售员',cashier_id: '出纳员 ',order_id: '开单员',}},
		moneyflow:{ _tp : 'd', cn : '资金流水',nav:'fi',cols : {number:'流水号',aper:'付款方[账户]',arer:'收款方[账户]',cashier_id: '出纳员',amount: '金额',type:'类型',}},
		//以下为虚拟表
		
		store:{cn:'库存',nav:'stock',cols:{product:'产品',spec:'规格',unit:'单位',t_cost:'平均成本',t_amount:'总金额',t_count:'总库存',}},
		statement:{cn:'客户对账',nav:'fi',cols:{name:'客户',count:'总签单',amount:'总欠款',lm:'更新日期',month:'月份',mcount:'签单数',mamount:'签单金额',mpreamount:'订金'},sort:{'count':' ','amount':' ','lm':'asc'}},
		supplierstatement:{cn:'供应商对账',nav:'fi',cols:{name:'供应商',allcount:'总单数',total:'总欠款',lm:'更新日期',month:'月份',count:'签单数',amount:'签单金额',preamount:'订金'}},
	}
	//预先插入的数据
	k.conf.preinsert={
	    xianjin:{tn:'account',number:'1001',name:'现金'},
	    classify:{tn:'setup',type:'classify','moneyflow':{a0:{v:'销售收入',f:1},b0:{v:'采购支出',f:1},c0:{v:'帐户互转',f:1}}},
	    roll:{tn:'setup',type:'roll',value:1,r0:{name:'总经理',remark:'拥有系统所有权限',f:1}},
	    setting:{tn:'setup',type:'setting'},
	};
	k.conf.frame={"p":[{"en":"home","cn":"开单宝",
		   "sol":[{"en":"start","cn":"起始页",
		       	   "plug":[{"en":"welcome","cn":"欢迎首页"},
		       	           {"en":"usercenter","cn":"用户中心"}]
//		        },{"en":"offical","cn":"办公精选",
//			           "plug":[{"en":"wjyp","cn":"文具用品"}]
//		        },{"en":"service","cn":"服务支持",
//		           "plug":[{"en":"question","cn":"在线问答"},
//		                   {"en":"faq","cn":"帮助手册"}]
		        }]
		},{"en":"sale","cn":"销售",
		   "sol":[{"en":"order","cn":"销售订单",
			       "plug":[{"en":"salebilling","cn":"销售开单"},
			               {"en":"salebill","cn":"销售单查询"},
//			               {"en":"quotation","cn":"客户报价单"}
			               ]
		        },{"en":"baseinfo1","cn":"资料管理",
			       "plug":[{"en":"product","cn":"商品信息"},
				    	   {"en":"clerk","cn":"职员信息"},
			               {"en":"customer","cn":"客户信息"}]
		        }]
			},{"en":"stock","cn":"库存",
		   "sol":[{"en":"stockmanage","cn":"仓储管理",
		       	   "plug":[{"en":"store","cn":"库存查询"},
		       		   	   {"en":"supplier","cn":"供应商信息"}]
//			    },{"en":"baseinfo2","cn":"资料管理",
//			       "plug":[{"en":"repository","cn":"仓库信息"},
//	       		   	   	   {"en":"billconfirm","cn":"出入库确认"}]
			    },{"en":"purchasemanage","cn":"采购管理",
	               "plug":[{"en":"bringbilling","cn":"采购开单"},
	                       {"en":"bringbill","cn":"采购单查询"}]
//	        	},{"en":"stockbill","cn":"仓库变动",
//	        		"plug":[{"en":"checkbilling","cn":"库存盘点"},
//	        		        {"en":"checkbill","cn":"盘点单查询"},
//	        		        {"en":"allotbilling","cn":"调拨开单"},
//	        		        {"en":"allotbill","cn":"调拨单查询"}]
//	        	},{"en":"productmanage","cn":"生产管理",
//	        		"plug":[{"en":"producttpl","cn":"生产模板"},
//	        		        {"en":"productbilling","cn":"生产开单"},
//	        		        {"en":"productbill","cn":"生产单查询"}]
	        	}]
		},{"en":"fi","cn":"财务",
		   "sol":[{"en":"balance","cn":"对账出纳",
		           "plug":[{"en":"statement","cn":"往来对账"},
		                   {"en":"moneyflow","cn":"出纳流水"}]
			    },{"en":"baseinfo3","cn":"资料管理",
			       "plug":[{"en":"account","cn":"账户管理"}]
//		        },{"en":"balancesheet","cn":"财务报表",
//		           "plug":[{"en":"balance3","cn":"利润表"},
//		                   {"en":"balance2","cn":"现金流表"},
//		                   {"en":"balance1","cn":"资产负债表"}]
		        }]
//		},{"en":"chart","cn":"统计",
//		   "sol":[{"en":"bysales","cn":"销售与采购",
//		           "plug":[{"en":"salebyvolume","cn":"总销量"},
//		                   {"en":"salebycustomer","cn":"客户分析"},
//		                   {"en":"salebyproduct","cn":"商品分析"}]
//		       },{"en":"bystock","cn":"库存与生产",
//		           "plug":[{"en":"salebyvolume1","cn":"库存分析"},
//		                   {"en":"salebyproduct1","cn":"采购统计"}]
//		       },{"en":"byfi","cn":"财务与账户",
//		           "plug":[{"en":"salebyvolume2","cn":"资产负债表"},
//		                   {"en":"salebycustomer2","cn":"现金流表"}]
//		       }]
		}],
		"other":{
			right:[{en:'delete',cn:'删除订单',
				'plug':[
					{en:'salebill',cn:'销售单'},
					{en:'bringbill',cn:'采购单'},
				],
			}],
		}}
})(window.kaidanbao);/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	//自动完成特殊存储
	var product_auto,auto={},headLen=0,cidCache;
	var pushHead=function(cid){
		var customer=k.cache.get(cid),len=0,v;
		if(!customer || !customer.quotation) return;
		product_auto.reverse(); 
		for(var pid in customer.quotation){
			v = k.cache.fixed[pid];
			if(v){ len++;
				product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+customer.quotation[pid][0]+'/'+(v.unit ||'')+']'
					,data:{id:v._id,price:customer.quotation[pid][0],r:'-',spec:customer.quotation[pid][1],c:'blue'}});
			}
		}
		product_auto.reverse(); 
		headLen = len;
	}
	var popHead=function(){
		if(headLen === 0) return;
		product_auto.reverse();
		product_auto.length -= headLen;
		product_auto.reverse();
		headLen=0;
	}
	k.aspect.atcp={
		product_auto:function(pd,cid){
			if(!product_auto){ product_auto=[];
			    var v1=k.cache.fixed_by_table['product'],v;
			    for(var j in v1){ v = k.cache.get(v1[j]);
					if(v){
						product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+v.price+'/'+(v.unit ||'')+']'
							,data:{id:v._id,price:v.price,r:'-'}});
					}
				}
			}
			if(cid){
				if(cid !== cidCache){
					popHead();
					pushHead(cid);
				}
			}else{
				if(cid !== 0) popHead();
			}
			if(cid !== 0) cidCache = cid;
			if(pd){
				popHead();
				if(isNaN(pd)){ //pd is id array
					
				}else{ //pd is id number
					var v1 = k.cache.get(pd);
					if(v1){
						product_auto.unshift({value:v1.name+' ['+(v1.number ||'')+' ￥'+v1.price+'/'+(v1.unit ||'')+']'
							,data:{id:v1._id,price:v1.price,r:'-'}});
					}
				}
				pushHead(cidCache);
			}
			return product_auto;
		},
		auto:function(ct,table){
			if(table==='customer' || table==='supplier' || table==='clerk'){
				if(!auto[table]){ auto[table]=[];
					var v1=k.cache.fixed_by_table[table],v;
					for(var j in v1){ v = k.cache.get(v1[j]);
						if(v) auto[table].push({value:v.name+' '+(v.name_py ||''),data:{id:v._id}});
					};
				}
				if(ct){
					if(isNaN(ct)){ //ct is id array
						
					}else{ //ct is id number
						var v1 = k.cache.get(ct);
						if(v1){
							auto[table].unshift({value:(v1.name ||'')+' '+(v1.name_py ||''),data:{id:v1._id}});
						}
					}
				}
				return auto[table];
			}
		},
	}
	k.aspect.auto_insert=function(values,comp){//自动插入客户，供应商，职员
		var v,i,vid,vids={},len = values.length;
		if(len == 0) comp();
		else{
			for(i in values){
				v = values[i];
				vid = k.cache.name_cache[v.tn][v.name];
				if(vid) {
					vids[v.tn+v.name] = vid;
					if(--len ==  0) comp(vids);
				}else if(!vids[v.tn+v.name]){
					vids[v.tn+v.name] = true;
					v.name_py = u.pinyin.getSZM(v.name);
					k.dao.addOne(v,function(err,val){
						if(err){}
						else{
							k.aspect.atcp.auto(val._id,val.tn);
							vids[val.tn+val.name] = val._id;
							if(--len == 0) comp(vids);
							setTimeout(function() {
								$('#layout div.'+val.tn+' div.kc-manage-box button').click();
							}, 1);
						}
					},3);
				}
			}
		}
	}
	k.aspect.auto_insert_p=function(values,comp){//自动插入商品
		var v,i,vids=[],len = values.length;
		for(i in values){
			v = values[i];v.tn = 'product';v.type='b';
			k.dao.addOne(v,function(err,val){
				if(err){}
				else{
					k.aspect.atcp.product_auto(val._id,0);
					vids[val.tmp_td_id] = val._id;
					if(--len ==  0) comp(vids);
					setTimeout(function() {
						$('#layout div.product div.kc-manage-box button').click();
					}, 1);
				}
			},3);
		}
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u   = k.utils,asp = k.aspect,si;
	var bill_map={};
	/** 开单组件 */
	k.aspect.billing={
		init:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			si  = k.cache.sign.staff_id;
			$('#layout div.lay-main').append(' \
				<div hidden class="'+pn+'"> \
					<div class="bill-top"></div> \
					<table class="bill-table"></table> \
					<div class="bill-bottom"></div> \
          			<div class="bill-sub"></div> \
				</div>');
			asp.billing.bill_top();
			asp.billing.bill_table();
			asp.billing.bill_bottom();
			asp.billing.bill_sub();
			$(box+' input.clerk').autocomplete({
				minChars: 0,
				autoSelectFirst: true,
//				newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.aspect.manage.create(\'clerk\');$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增职员</span></div>',
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name).blur();
//					$(this).attr('data-id',s.data.id);
		        },
//		        onSearchComplete:function(q,s){
//		        	$(this).removeAttr('data-id');
//		        },
			});
			$(box+' button.refresh').click();
		},
		bill_top:function(){//构建表单顶部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			if(pn==='salebilling'){
				html = '<div style="width:26%;">客户：<input class="customer" type="search" style="width:75%;" /></div> \
					<div style="width:24%;">销售员：<input class="clerk saler" type="search" /></div> \
					<div style="width:24%;">开单员：<input class="clerk order" type="search" /></div> \
					<div style="width:26%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}else if(pn==='bringbilling'){
				html = '<div style="width:26%;">供应商：<input class="supplier" type="search" style="width:70%;" /></div> \
					<div style="width:24%;">采购员：<input class="clerk buyer" type="search" /></div> \
					<div style="width:24%;">开单员：<input class="clerk order" type="search" /></div> \
					<div style="width:26%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}
			$(box+' .bill-top').html(html);
		},
		bill_table:function(){//构建表格
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			html= '<tr> \
				<th style="width:3%;"><svg hidden version="1.1" viewBox="0 -70 1034 1034"><path d="M933.79 349.75c-53.726 93.054-21.416 212.304 72.152 266.488l-100.626 174.292c-28.75-16.854-62.176-26.518-97.846-26.518-107.536 0-194.708 87.746-194.708 195.99h-201.258c0.266-33.41-8.074-67.282-25.958-98.252-53.724-93.056-173.156-124.702-266.862-70.758l-100.624-174.292c28.97-16.472 54.050-40.588 71.886-71.478 53.638-92.908 21.512-211.92-71.708-266.224l100.626-174.292c28.65 16.696 61.916 26.254 97.4 26.254 107.196 0 194.144-87.192 194.7-194.958h201.254c-0.086 33.074 8.272 66.57 25.966 97.218 53.636 92.906 172.776 124.594 266.414 71.012l100.626 174.29c-28.78 16.466-53.692 40.498-71.434 71.228zM512 240.668c-114.508 0-207.336 92.824-207.336 207.334 0 114.508 92.826 207.334 207.336 207.334 114.508 0 207.332-92.826 207.332-207.334-0.002-114.51-92.824-207.334-207.332-207.334z"></path></svg></th> \
				<th style="width:29%;">商品名称</th> \
				<th style="width:8%;">规格</th> \
				<th style="width:6%;">单位</th> \
				<th style="width:9%;">数量</th> \
				<th style="width:9%;">单价 </th> \
				<th style="width:11%;">金额</th> \
				<th>备注</th></tr> \
				<tr><td class="num">1</td><td class="p_name"><input        type="search" data-index="0" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="0" class="count"></td><td data-index="0" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">2</td><td class="p_name"><input hidden type="search" data-index="1" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="1" class="count"></td><td data-index="1" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">3</td><td class="p_name"><input hidden type="search" data-index="2" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="2" class="count"></td><td data-index="2" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">4</td><td class="p_name"><input hidden type="search" data-index="3" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="3" class="count"></td><td data-index="3" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">5</td><td class="p_name"><input hidden type="search" data-index="4" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="4" class="count"></td><td data-index="4" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">6</td><td class="p_name"><input hidden type="search" data-index="5" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="5" class="count"></td><td data-index="5" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">7</td><td class="p_name"><input hidden type="search" data-index="6" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="6" class="count"></td><td data-index="6" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">8</td><td class="p_name"><input hidden type="search" data-index="7" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="7" class="count"></td><td data-index="7" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">9</td><td class="p_name"><input hidden type="search" data-index="8" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="8" class="count"></td><td data-index="8" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr class="foot"><td class="num"></td><td class="dx" colspan="3">合计：</td><td class="count-sum">0</td><td></td><td class="amount-sum">0.00</td><td></td></tr>';
			$(box+' .bill-table').html(html);
			
			$(box+' td').attr('spellcheck','false');
			$(box+' td.p_spec').attr('contenteditable','true');
			$(box+' td.p_unit').attr('contenteditable','true');
			$(box+' td.count').attr('contenteditable','true');
			$(box+' td.p_price').attr('contenteditable','true');
			$(box+' td.remark').attr('contenteditable','true');
			var amt_cal=function(index){
				var count = $(box+' td.count').eq(index).html();
				var price = $(box+' td.p_price').eq(index).html();
				if(u.is_float(count) && u.is_float(price)){
					count = parseFloat(count);
					price = parseFloat(price);
					$(box+' td.amount').eq(index).html((count*price).toFixed(2));
					$(box+' td.p_name input').eq(index+1).removeAttr('hidden');
				}else $(box+' td.amount').eq(index).html('');
				
				var t_count=0,t_amount=0,val;
				for(var i=0;i<9;i++){
					val = $(box+' td.amount').eq(i).html();
					if(val){
						t_amount += parseFloat(val);
						t_count  += parseFloat($(box+' td.count').eq(i).html());
					}
				}
				var tc = t_count.toFixed(3),
				ta = t_amount.toFixed(2);
				if(t_count == parseFloat(tc)) tc = t_count;
				$(box+" td.count-sum").html(tc);
				$(box+" td.amount-sum").html(ta);
				if($(box+' select.settlement').val()==='x') $(box+' input.payamount').val(ta);
				if(ta != 0) $(box+" td.dx").html('合计：'+u.DX(ta));
				else $(box+" td.dx").html('合计：');
			}
			$(box+' td.count,'+box+' td.p_price').keyup(function(e){
				amt_cal(parseInt($(this).attr('data-index')));
			});
			$(box+' td.count,'+box+' td.p_price').blur(function(e){
				amt_cal(parseInt($(this).attr('data-index')));
			});
			$(box+' td.count,'+box+' td.p_price').keypress(function(e){
				var index=parseInt($(this).attr('data-index'));
				if(e.keyCode === 13){
					if(index < 9) $(box+' td.p_name input').eq(index+1).focus();
					if(window.event) window.event.returnValue = false;
					else e.preventDefault();
				}
			});
			$(box+' td.p_name input').autocomplete({
		    	minChars: 0,
		    	width:'41.2%',
//		    	newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.plugin.product.create();$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增商品</span></div>',
		        lookup: k.aspect.atcp.product_auto(),
		        onSelect:function(s){
		        	var index=parseInt($(this).attr('data-index'));
		        	var p = k.cache.get(s.data.id);
		        	$(box+' td.p_name input').eq(index).val(p.name).attr('data-id',s.data.id);
		        	$(box+' td.p_unit').eq(index).html(p.unit).removeAttr('contenteditable');
		        	$(box+' td.p_spec').eq(index).html(s.data.spec?s.data.spec:p.spec);
		        	$(box+' td.p_price').eq(index).html(s.data.price);

		        	$(box+' td.count').eq(index).focus();
		        },
		        onSearchComplete:function(q,s){
		        	var index=parseInt($(this).attr('data-index'));
		        	$(box+' td.p_name input').eq(index).removeAttr('data-id');
		        	$(box+' td.p_unit').eq(index).attr('contenteditable','true');
		        	if(!$(box+' td.p_name input').eq(index).val()){
		        		$(box+' td.p_spec').eq(index).html('');
		        		$(box+' td.p_unit').eq(index).html('');
		        		$(box+' td.count').eq(index).html('');
		        		$(box+' td.p_price').eq(index).html('');
		        		$(box+' td.amount').eq(index).html('');
		        		$(box+' td.remark').eq(index).html('');
		        	}
		        },
		    });
		},
		bill_bottom:function(){//构建表单底部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var html= ' \
				结算：<select class="settlement"><option value="q" >签单对账</option><option value="x" >现付全款</option></select> , \
				本次付款：<input class="payamount" value="0.00" /> , \
				账户：<select class="account"></select> , \
				出纳员：<input class="clerk cashier" type="search" /> , \
				摘要：<input class="pay-remark" type="text" />';
			$(box+' .bill-bottom').html(html);
			$(box+' select.settlement').change(function(){
				if($(this).val()==='q') $(box+' input.payamount').val('0.00');
				else $(box+' input.payamount').val($(box+' td.amount-sum').html());
			});
			if(pn==='salebilling'){
				$(box+' input.customer').autocomplete({
					minChars: 0,
					showNoSuggestionNotice: false,
					lookup: k.aspect.atcp.auto(null,'customer'),
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.customer').blur();
						$(box+' td.p_name input').eq(0).focus();
					},
				});
				$(box+' input.customer').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['customer'][$(this).val().trim()]);
				});
				$(box+' input.customer').keydown(function(e){
					if(e.keyCode === 13 && $(box+' input.customer').val() && !e.ctrlKey){
						$(box+' td.p_name input').eq(0).focus();
					}
				});
			}else if(pn==='bringbilling'){
				$(box+' input.supplier').autocomplete({
					minChars: 0,
					showNoSuggestionNotice: false,
					lookup: k.aspect.atcp.auto(null,'supplier'),
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.supplier').blur();
						$(box+' td.p_name input').eq(0).focus();
			        },
				});
				$(box+' input.supplier').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['supplier'][$(this).val().trim()]);
				});
				$(box+' input.supplier').keydown(function(e){
					if(e.keyCode === 13  && $(box+' input.supplier').val() && !e.ctrlKey){
						$(box+' td.p_name input').eq(0).focus();
					}
				});
			}
		},
		bill_sub:function(){//构建表单按钮
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var html= ' \
				<button class="submit">提交</button> \
				<button class="print-now">打印</button> \
				<button class="print-set">打印设置</button> \
				<button class="refresh">刷新</button>';
			$(box+' .bill-sub').html(html);
			$(box+' button.submit').click(function(){
				if(!asp.billing.check_bill()) return;
				asp.billing.create_bill(function(bill){
					k.dao.addOne(bill,function(err,id){
						if(id) {
							bill_map[k.frame.current_plugin] = bill;
							if(pn==='salebilling'){
								k.aspect.noty.message('新增销售单成功!');
							}
							if(pn==='bringbilling'){
								k.aspect.noty.message('新增采购单成功!');
							}
							$(box+' button.submit').html('成功').attr('disabled','disabled');
							$(box+' button.print-now').removeAttr('disabled').focus();
							setTimeout(function() {
								asp.billing.save_setting(bill,function(){
									asp.billing.save_moneyflow(bill,function(){
										k.syn.upl(function(){
											asp.billing.save_quotation(bill);
										});
									});
								});
							}, 500);
						}else k.aspect.noty.message('新增销售单失败!');
					},3);
				});
			});
			$(box+' button.print-now').click(function(){
				asp.print.prepare(bill_map[k.frame.current_plugin]);
				asp.print.ad();
				if(asp.print.act()) $(box+' button.print-now').attr('disabled','disabled');
				$(box+' button.refresh').focus();
			});
			$(box+' button.print-set').click(function(){
				asp.print.prepare(null,'[test]');
				var pn = k.frame.current_plugin,setting,type,title,tips,notice,color;
				$.facebox($('#print').html());
				if(pn === 'salebilling'){
					type = 'salebill-print';
					setting = k.cache.setup(type);
					$('#facebox div.title').html('<a href="#/sale/salebilling">销售开单</a> > 打印设置（鼠标点击文字即可修改设置）');
				}else if(pn === 'bringbilling'){
					type = 'bringbill-print';
					setting = k.cache.setup(type);
					$('#facebox div.title').html('<a href="#/sale/bringbilling">采购开单</a> > 打印设置（鼠标点击文字即可修改设置）');
				}
				$('#facebox div.footer').html('<button class="save">保存设置</button><button onclick="kaidanbao.aspect.print.facebox(1);">打印样单</button>');
				$('#facebox .print').css('width','203mm');
				$('#facebox .print td,#facebox .print th').css('border','1px solid #000');
//				$('#facebox .print').find('.tit').css('font-size','9mm');
				
				$('#facebox button.save').click(function(){
					title = $('#facebox .print .tit').html();
					tips = $('#facebox .print .tips').html();
					notice = $('#facebox .print .notice').html();
					color = $('#facebox .print .color').html();
					var up={tn:'setup',type:type},change;
					if(setting){
						if(setting.title !== title) {up.title = title;change=true;}
						if(setting.tips !== tips) {up.tips = tips;change=true;}
						if(setting.notice !== notice) {up.notice = notice;change=true;}
						if(setting.color !== color) {up.color = color;change=true;}
						if(change){
							up._id = setting._id;
							k.dao.updOne(up,function(err,r){
								if(r){ k.aspect.noty.message('打印设置保存成功！'); }
							});
						}
					}else{
						up.title = title;
						up.tips = tips;
						up.notice = notice;
						up.color = color;
						k.dao.addOne(up,function(err,id){
							if(id){
								k.aspect.noty.message('打印设置保存成功！');
							}
						});
					}
					$.facebox.close();
				});
			});
			$(box+' button.refresh').click(function(){
				$(box+' input.customer').val('');
				$(box+' input.supplier').val('');
				bill_map[k.frame.current_plugin] = null;
				k.aspect.atcp.product_auto();
				asp.billing.clear_table();
				k.aspect.manage.selectAccountRefresh($(box+' select.account'));
				$(box+' td.p_name input').eq(0).removeAttr('hidden');
				$(box+' input.payamount').val('0.00');
				var prefix_map={'salebilling':'XS-','bringbilling':'CG-'};
				$(box+' input.number').val(prefix_map[pn]+k.aspect.manage.get_number());
				$(box+' button.submit').removeAttr('disabled').html('提交');
				$(box+' button.print-now').removeAttr('disabled');
				$(box+' button.print-now').attr('disabled','disabled');
				$(box+' select.settlement').val('q');
				$(box+' input.pay-remark').val('');
				asp.billing.set_default();
			});
		},
		check_bill:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			if(pn==='salebilling'){
				if(!$(box+' input.customer').val().trim()){
					k.aspect.noty.message('客户不能为空!');
					$(box+' input.customer').focus();
					return false;
				}
				if(!$(box+' input.saler').val().trim()){
					k.aspect.noty.message('销售员不能为空!');
					$(box+' input.saler').focus();
					return false;
				}
			}else if(pn==='bringbilling'){
				if(!$(box+' input.supplier').val().trim()){
					k.aspect.noty.message('供应商不能为空!');
					$(box+' input.supplier').focus();
					return false;
				}
				if(!$(box+' input.buyer').val().trim()){
					k.aspect.noty.message('采购员不能为空!');
					$(box+' input.buyer').focus();
					return false;
				}
			}
		    if(!u.is_float($(box+' input.payamount').val().trim())){
		    	k.aspect.noty.message('付款金额必须为数值!');
		    	$(box+' input.payamount').focus();
		    	return false;
		    }
		    if(parseFloat($(box+' input.payamount').val()) !=0 && !$(box+' input.cashier').val().trim()){
		    	k.aspect.noty.message('出纳员不能为空!');
		    	$(box+' input.cashier').focus();
		    	return false
		    }
		    for(var i=0;i<9;i++){
		    	if($(box+' td.p_name input').eq(i).val()){
		    		if(!$(box+' td.amount').eq(i).html()){
		    			k.aspect.noty.message('商品详情无效!');
		    			return false;
		    		}
		    	}else{
		    		if($(box+' td.amount').eq(i).html()){
		    			k.aspect.noty.message('商品详情无效!');
		    			return false;
		    		}else break;
		    	}
			}
			if(i == 0){
				k.aspect.noty.message('商品详情无效!');
				return false;
			}else return true;
		},
		create_bill:function(comp){//仅开单提交时使用
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var bill={detail:[]},detail;
		    bill.number 	 = $(box+' input.number').val();
		    bill.count       = parseFloat($(box+' td.count-sum').html());
		    bill.amount      = parseFloat($(box+' td.amount-sum').html());
		    bill.settlement  = $(box+' select.settlement').val();

		    var order   = $(box+' input.order').val().trim(),
		    	cashier = $(box+' input.cashier').val().trim(),
		        buyer,saler,customer,supplier;

		    bill.payamount     = parseFloat($(box+' input.payamount').val().trim());
		    if(bill.payamount != 0){
		    	bill.account_id  = parseInt($(box+' select.account').val());
		    }else delete bill.payamount;
		    if(pn==='salebilling'){
		    	bill.tn='salebill';
		    	customer = $(box+' input.customer').val().trim();
		    	saler = $(box+' input.saler').val().trim();
		    }else if(pn==='bringbilling'){
		    	bill.tn='bringbill';
		    	supplier = $(box+' input.supplier').val().trim();
		    	buyer = $(box+' input.buyer').val().trim();
		    }
		    var auto_insert_vals=[];
		    if(order) auto_insert_vals.push({tn:'clerk',name:order});
		    if(cashier) auto_insert_vals.push({tn:'clerk',name:cashier});
		    if(buyer) auto_insert_vals.push({tn:'clerk',name:buyer});
		    if(saler) auto_insert_vals.push({tn:'clerk',name:saler});
		    
		    if(customer) auto_insert_vals.push({tn:'customer',name:customer});
		    if(supplier) auto_insert_vals.push({tn:'supplier',name:supplier});
		    k.aspect.auto_insert(auto_insert_vals,function(ids){
		    	if(ids){
		    		if(ids['clerk'+order]) bill.order_id = ids['clerk'+order];
		    		if(ids['clerk'+cashier]) bill.cashier_id = ids['clerk'+cashier];
		    		if(ids['clerk'+buyer]) bill.buyer_id = ids['clerk'+buyer];
		    		if(ids['clerk'+saler]) bill.saler_id = ids['clerk'+saler];
		    		if(ids['customer'+customer]) bill.customer_id = ids['customer'+customer];
		    		if(ids['supplier'+supplier]) bill.supplier_id = ids['supplier'+supplier];
		    	}
		    	var auto_insert_ps = [],pname;
		    	for(var i=0;i<9;i++){
		    		detail=[];pname = $(box+' td.p_name input').eq(i).val().trim();
		    		detail[4] = $(box+' td.amount').eq(i).html();
		    		if(detail[4] && pname){
		    			detail[0] = parseInt($(box+' td.p_name input').eq(i).attr('data-id'));
		    			detail[1] = $(box+' td.p_spec').eq(i).html();
		    			detail[2] = parseFloat($(box+' td.count').eq(i).html());
		    			detail[3] = parseFloat($(box+' td.p_price').eq(i).html());
		    			detail[4] = parseFloat(detail[4]);
		    			detail[5] = $(box+' td.remark').eq(i).html();
//		    			detail[6] = k.cache.get(detail[0]).type;
		    			bill.detail.push(detail);
		    			if(!detail[0]) {
		    				auto_insert_ps.push(
		    						{name : pname,unit : $(box+' td.p_unit').eq(i).html(),
	    							 spec : detail[1],price: detail[3],tmp_td_id:i });
		    			}
		    		}
		    	}
		    	if(auto_insert_ps.length>0){
		    		 k.aspect.auto_insert_p(auto_insert_ps,function(ids){
		    			 for(var j=0;j<9;j++){
		    				 if(bill.detail[j] && !bill.detail[j][0] && ids[j]){
		    					 bill.detail[j][0] = ids[j];
		    				 }
		    			 }
		    			 comp(bill);
		    		 });
		    	}else comp(bill);
		    });
		},
		save_moneyflow:function(bill,comp){
			var moneyflow={tn:'moneyflow'};
			if(bill.payamount){
				var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
				if(pn==='salebilling'){
					moneyflow.type='xs';
					moneyflow.aper_id=bill.customer_id;
					moneyflow.account_r=bill.account_id;
				}
				if(pn==='bringbilling'){
					moneyflow.type='cg';
					moneyflow.arer_id=bill.supplier_id;
					moneyflow.account_p=bill.account_id;
				}
				moneyflow.number='CN'+bill.number.substring(2);
				moneyflow.flag=(bill.settlement==='x'?'d':'a');
				moneyflow.amount=bill.payamount;
				moneyflow.cashier_id=bill.cashier_id;
				moneyflow.bill_number = bill.number;
				k.dao.addOne(moneyflow,function(err,id){
					comp();
				},3);
			}else comp();
		},
		save_setting:function(bill,comp){//保存设置
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var setting=k.cache.setup(pn);
			var set_change_id=setting._id,set_change={tn:'setup'},change_count=0;
			
			var buyer = $(box+' input.buyer').val(),buyer_id;
			if(buyer) { buyer_id = k.cache.name_cache['clerk'][buyer.trim()];
				if(setting['buyer'+si]!==buyer_id ){
					change_count++;set_change['buyer'+si]=buyer_id;
				}
			}
			var saler = $(box+' input.saler').val(),saler_id;
			if(saler) { saler_id = k.cache.name_cache['clerk'][saler.trim()];
				if(setting['saler'+si]!==saler_id ){
					change_count++;set_change['saler'+si]=saler_id;
				}
			}
			var order = $(box+' input.order').val().trim(),order_id;
			if(order) { order_id = k.cache.name_cache['clerk'][order];
				if(setting['order'+si]!==order_id ){
					change_count++;set_change['order'+si]=order_id;
				}
			}
			var cashier = $(box+' input.cashier').val().trim(),cashier_id;
			if(cashier) { cashier_id = k.cache.name_cache['clerk'][cashier];
				if(setting['cashier'+si]!==cashier_id ){
					change_count++;set_change['cashier'+si]=cashier_id;
				}
			}
			var account = $(box+' select.account').val();
//			var repository = $(box+' select.repository').val();
			if(setting['account'+si]!== parseInt(account)){change_count++;set_change['account'+si]=parseInt(account);}
//			if(setting['repository'+si]!==parseInt(repository)){change_count++;set_change['repository'+si]=parseInt(repository);}
			
			if(change_count>0){
				if(set_change_id){
					set_change._id=set_change_id;
					k.dao.updOne(set_change,comp,3);
				}else{
					set_change['type']=pn;
					k.dao.addOne(set_change,comp,3);
				}
			}else comp()
		},
		save_quotation:function(bill){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,ogi;
			if(pn ==='salebilling') ogi = k.cache.get(bill.customer_id);
			if(pn ==='bringbilling') ogi = k.cache.get(bill.supplier_id);
			var up={_id:ogi._id,tn:ogi.tn};
			
			if(bill.settlement === 'q'){ //保存对账
				up['s'+k.cache.dates.mt[0]] = (ogi['s'+k.cache.dates.mt[0]] || {});
				up['s'+k.cache.dates.mt[0]]['i'+bill._id] = [bill.number,bill.amount,bill.payamount];
			}
			up.quotation=(ogi.quotation || {});  //保存报价单
			for(var j in bill.detail){
				if(bill.detail[j][3] != 0){
					up.quotation['i'+bill.detail[j][0]] = [bill.detail[j][3],bill.detail[j][1]];
				}
			}
			k.dao.updOne(up,null,3);//保存客户变化
		},
		clear_table:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			$(box+' td.p_name input').val('').attr('hidden','hidden').removeAttr('data-id');
			$(box+' td.p_spec').html('');$(box+' td.remark').html('');
        	$(box+' td.count').html('');$(box+' td.p_price').html('');
        	$(box+' td.amount').html('');$(box+' td.p_unit').html('').attr('contenteditable','true');

        	$(box+' td.dx').html('合计：');$(box+' td.count-sum').html('0');
        	$(box+' td.amount-sum').html('0.00');
        	
        	$(box+' td.p_name input').eq(0).removeAttr('hidden');
			$(box+' input.pay-remark').val('');
		},
		set_default:function(){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			var setting=k.cache.setup(pn);
			if(setting['buyer'+si]) $(box+' input.buyer').val(k.cache.get(setting['buyer'+si]).name);
			if(setting['saler'+si]) $(box+' input.saler').val(k.cache.get(setting['saler'+si]).name);
			if(setting['order'+si]) $(box+' input.order').val(k.cache.get(setting['order'+si]).name);
			if(setting['cashier'+si]) $(box+' input.cashier').val(k.cache.get(setting['cashier'+si]).name);
			if(setting['account'+si]) $(box+' select.account').val(setting['account'+si]);
//			if(setting['repository'+si]) $(box+' select.repository').val(setting['repository'+si]);
		},
	}
	k.aspect.bill={
		view:function(id,tn){
			k.dao.get(tn,id,function(bill){
				if(!bill) return;
				k.aspect.print.prepare(bill);
				$.facebox($('#print').html());
				$('#facebox div.title').html('查看订单详情');
				$('#facebox .print').css('width','203mm');
				$('#facebox .print td,#facebox .print th').css('border','1px solid #000');
				$('#facebox .print th').css('background-color','#fff');
				
				$('#facebox div.footer').html('<button onclick="kaidanbao.aspect.print.facebox();">打印</button><button class="del" style="color:#f08;">删除</button>');
				$('#facebox button.del').click(function(){
					k.aspect.noty.confirm('<br /><h1>确定删除订单？</h1>',function(){
						k.dao.del(tn,id,function(){
							k.aspect.noty.message('删除成功！');
							var ogi = k.cache.get(bill.customer_id || bill.supplier_id),up={_id:ogi._id,tn:ogi.tn};
							var date = bill.number.split('-')[2],sd='s'+date.substr(2,4);
							if(bill.settlement === 'q' && ogi[sd] !== 'x'){ //保存对账
								up[sd] = ogi[sd];
								up[sd]['i'+bill._id][3] = 'x';
								
								k.dao.updOne(up,null,1);//仅缓存客户变化
							}
							$.facebox.close();
							k.aspect.noty.confirm_close();
							$('#layout div.'+tn+' div.kc-manage-box button').click();
						});
					});
				});
			});
		},
		init:function(){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			//根据字段，填充th
//			k.aspect.manage.th_fill($(box+' table.kc-manage-list th.remark'),pn);
			k.aspect.manage.init({search:function(c){
				if(pn==='salebill'){ $(box+' input').attr('placeholder','搜索单号、客户、销售员、商品');}
				else if(pn==='bringbill'){ $(box+' input').attr('placeholder','搜索单号、供应商、采购员、商品');}
				var query = $(box+' input').val().trim(),qs,qs_len,matchs=0;
				if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
				$(box+' table.kc-manage-list tr.list').remove();
				var amount=0,n=0,i=0;
				var s1 = $(box+' select.s1').val(),s2 = $(box+' select.s2').val();
				k.dao.queryDynamicByMonth(pn,s2,function(finish){
					if(finish) {
						//排序
						var v1=k.cache.dynamic[pn][s2],v;
						var asc  = $(box +' th.sort.asc').attr('data-sort');
						var desc = $(box +' th.sort.desc').attr('data-sort');
						if(asc){
							v1.sort(function(a,b){
								if(a[asc] && b[asc]) return a[asc] < b[asc]?1:-1;
								else if(b[asc]) return 1;
								else return -1;
							});
						}else if(desc){
							v1.sort(function(a,b){
								if(a[desc] && b[desc]) return a[desc] > b[desc]?1:-1;
								else if(a[desc]) return 1;
								else return -1;
							});
						}
						var rowspan,j,len;
						for(var idx in v1){ v = u.extend({},v1[idx]);
							v.product=[];len=0;
							if((v.st!=='d' && s1==='del') || (v.st==='d' && s1!=='del')) continue;
							for(j in v.detail){
								if(s1!=='tt' || v.detail[j][4] < 0) {
									v.product[j] = (k.cache.get(v.detail[j][0]).number || '')+' '+k.cache.get(v.detail[j][0]).name;
									len++;
								}
							}
							if(len > 0){
								v.supplier=k.cache.get(v.supplier_id).name;
								v.customer=k.cache.get(v.customer_id).name;
								v.saler=(k.cache.get(v.saler_id).name ||'');
								v.buyer=(k.cache.get(v.buyer_id).name ||'');
								if(qs){
									matchs=0;
									for(var iq in qs){
										if(v.number.toLowerCase().indexOf(qs[iq])>=0){
											v.number = v.number.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
											matchs++;
										}
										if(pn==='salebill'){
											if(v.customer.toLowerCase().indexOf(qs[iq])>=0){
												v.customer = v.customer.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
											if(v.saler.toLowerCase().indexOf(qs[iq])>=0){
												v.saler = v.saler.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
										}else if(pn==='bringbill'){
											if(v.supplier.toLowerCase().indexOf(qs[iq])>=0){
												v.supplier = v.supplier.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
											if(v.buyer.toLowerCase().indexOf(qs[iq])>=0){
												v.buyer = v.buyer.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
										}
										for(j in v.detail){
											if(v.product[j].toLowerCase().indexOf(qs[iq])>=0){
												v.product[j] = v.product[j].replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;break;
											}
										}
									}
									if(matchs < qs_len) continue;
								}
								if(pn==='salebill'){
									rowspan='</td><td rowspan="'+len+'"><span title="查看" onclick="kaidanbao.aspect.bill.view('+v._id+',\''+pn+'\')">'+v.number+'</span></td><td style="text-align:left;white-space:normal;width:8%;" rowspan="'+len+'">'+v.customer+'</td><td style="text-align:left;" rowspan="'+len+'">'+v.saler+'</td><td rowspan="'+len+'">'+v.amount+'</td><td rowspan="'+len+'">'+(v.payamount || 0);
								}else if(pn==='bringbill'){
									rowspan='</td><td rowspan="'+len+'"><span title="查看" onclick="kaidanbao.aspect.bill.view('+v._id+',\''+pn+'\')">'+v.number+'</span></td><td style="text-align:left;white-space:normal;width:8%;" rowspan="'+len+'">'+v.supplier+'</td><td style="text-align:left;" rowspan="'+len+'">'+v.buyer+'</td><td rowspan="'+len+'">'+v.amount+'</td><td rowspan="'+len+'">'+(v.payamount || 0);
								}
								n++;
								for(j in v.detail){
									if(v.product[j]){
										amount += v.detail[j][4];
										$(box+' table.kc-manage-list').append(
												'<tr class="list '+(n%2===0?'opp':'')+'"><td class="num">'+(++i)+rowspan
												+'</td><td style="text-align:left;">'+v.product[j]
												+'</td><td>'+(v.detail[j][1] ||'')
												+'</td><td>'+(v.detail[j][2] ||'')
												+'</td><td>'+(v.detail[j][3] ||'')+'/'+(k.cache.get(v.detail[j][0]).unit ||'')
												+'</td><td class="remark">'+(v.detail[j][5] ||'')
												+'</td></tr>');
										rowspan='';
									}
								}
							}
						}
						$(box+' section.summary-box').html('总计：'+i+' 条，'+amount.toFixed(2)+' 元');
					}
				});
//				}
			},select:function(){
				if(pn==='salebill'){
					$(box+' select.s1').append('<option value="dt"><销售单></option>');
				}else if(pn==='bringbill'){
					$(box+' select.s1').append('<option value="dt"><采购单></option>');
				}
				$(box+' select.s1').append('<option value="tt"><退货单></option><option value="del"><已删除></option>');
				for(var i in k.cache.dates.m_t){
					if(i<=k.cache.sign.month_length) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
				}
			},create:'noop',classify:'noop'});
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	/** 客户表增删改查组件 */
	k.aspect.manage={
		sort:function(that,tn){
			if($(that).hasClass('asc')){
				$(that).removeClass('asc');
				$(that).addClass('desc');
			}else{
				$(that).parent().children('.sort').removeClass('asc').removeClass('desc');
				$(that).addClass('asc');
			}
			$('div.'+tn+' .kc-manage-box button.s-btn').click();
		},
		th_fill:function(target,tn){
			var sort_value;
			for(var col in k.conf.table[tn]['cols']){
				if(k.conf.table[tn]['sort'] && k.conf.table[tn]['sort'][col]){
					sort_value = k.conf.table[tn]['sort'][col];
					target.before('<th data-sort="'+col+'" onclick="kaidanbao.aspect.manage.sort(this,\''
							+tn+'\')" class="norm sort '+(sort_value||'')+'">'+k.conf.table[tn]['cols'][col]+'</th>');
				}else{
					target.before('<th class="norm">'+k.conf.table[tn]['cols'][col]+'</th>');
				}
			}
		},
		search_enter:function(e){
			if(e.keyCode == "13" || !$(e.target).val()) {//keyCode=13是回车键
	            $(e.target.nextSibling.nextSibling.nextSibling).click();
	        }
		},
		get_number:function(){
			return k.cache.sign.staff_id+'-'+u.date.getTimeFormat(0,'dt').replace(/-/g,'').replace(/:/g,'').replace(/ /g,'-');
		},
		selectAccountRefresh:function(target,mod){
			target.html('');
			if(mod==='a'){ target.append('<option value="a"><所有账户></option>'); }
			var i,a,cache_map={};
			for(i in k.cache.fixed_by_table['account']){
				if(!cache_map['i'+k.cache.fixed_by_table['account'][i]]){
					cache_map['i'+k.cache.fixed_by_table['account'][i]]=1;
					a = k.cache.get(k.cache.fixed_by_table['account'][i]);
					target.append('<option value="'+a._id+'">'+a.name+'</option>');
				}
			}
		},
		selectClassifyRefresh:function(target,tn,mod){
			target.html('');
			var clazz = k.cache.setup(tn+'_classify').value,map={a:'类型',b:'类别'};
			if(mod[1]==='a') target.append('<option value="a"><所有'+map[mod[0]]+'></option>');
			if(mod[2]==='n') target.append('<option value="n"><无'+map[mod[0]]+'></option>');
			if(clazz){
				for(var key in clazz){
					if(key[0]==mod[0] && clazz[key].v) target.append('<option value="'+key+'">'+clazz[key].v+'</option>');
				}
			}
		},
		search:function(c){
			var query = $(c.box+' .kc-manage-box input').val().trim(),qs,qs_len,matchs=0;
			if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
			var s1 = $(c.box+' .kc-manage-box select.s1').val(),i=1,clazz;
			var s2 = $(c.box+' .kc-manage-box select.s2').val();
			$(c.box+' table.kc-manage-list tr.list').remove();
			
			var v1=k.cache.fixed_page[c.table],v,map={};
			var asc  = $(c.box +' th.sort.asc').attr('data-sort');
			var desc = $(c.box +' th.sort.desc').attr('data-sort');
			if(asc){
				v1.sort(function(a,b,va,vb){
					va = k.cache.get(a)[asc];vb=k.cache.get(b)[asc];
					if(va && vb) return va < vb?1:-1;
					else if(vb) return 1;
					else return -1;
				});
			}else if(desc){
				v1.sort(function(a,b,va,vb){
					va = k.cache.get(a)[desc];vb=k.cache.get(b)[desc];
					if(va && vb) return va > vb?1:-1;
					else if(va) return 1;
					else return -1;
				});
			}
			var classify=k.cache.setup(c.table+'_classify') || {value:''};
			for(var j in v1){ v = u.extend({},k.cache.get(v1[j]));
				if(map['i'+v1[j]]){continue;}   //由于每次添加编辑会unshift，避免重复
				else{map['i'+v1[j]]=1}

				if(s1==='n' && v.mold && classify.value[v.mold] && classify.value[v.mold].v) continue;
				if(s1 !=='n' && s1 !=='a' && v.mold !== s1) continue;
				if(s2==='n' && v.classify && classify.value[v.classify] && classify.value[v.classify].v) continue;
				if(s2!=='n' && s2 !=='a' && v.classify !== s2) continue;
				
				v.number = v.number || '';
				if(qs){
					matchs=0;
					for(var iq in qs){
						if(v.number && v.number.toLowerCase().indexOf(qs[iq])>=0){
							v.number = v.number.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
							matchs++;
						}
						if(v.name.toLowerCase().indexOf(qs[iq])>=0){
							v.name = v.name.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
							matchs++;
						}
					}
					if(matchs < qs_len) continue;
				}
				if(c.count) c.count(v);
				if(v.mold && classify.value[v.mold] && classify.value[v.mold].v) v.mold = classify.value[v.mold].v;
				else v.mold='<无类型>';
				if(v.classify && classify.value[v.classify] && classify.value[v.classify].v) v.classify = classify.value[v.classify].v;
				else v.classify='<无类别>';
				v.ct = u.date.getTimeFormat(v.ct,'d');
				v.lm = u.date.getTimeFormat(v.lm,'d');
				var tds  = '';
				for(var col in k.conf.table[c.table]['cols']){
					if(col === 'name') tds += ('<td style="text-align:left;"><span title="查看" onclick="kaidanbao.aspect.manage.modify('+v._id+')">'+v.name+'</span></td>');
					else tds += ('<td>'+(v[col] ||'')+'</td>');
				}
				$(c.box+' table.kc-manage-list').append('<tr class="list '+(i%2===0?'opp':'')+'"><td class="num">'+(i++)+'</td>'+tds+'<td class="remark">'+
						(v.remark ||'')+'</td></tr>');
			}
			if(c.notice) c.notice();
		},
		insert:function(table){
			var value={tn:table},key,val;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'classify' || key === 'mold'){
						val = $('#facebox select.'+key).val();
						if(val !== 'n') value[key] = val;
					}else if(key!='ct' && key!='lm'){
						val = $('#facebox input.'+key).val().trim();
						if(val) value[key] = val;
					}
				} 
			}
			if(value['name']){
				if(k.cache.name_cache[table][value['name']]){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能重复!');
					return;
				}
			}else{
				k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能为空!');
				return;
			}
			if(k.conf.table[table].py) value['name_py']=$('#facebox input.pinyin').val().trim();
			var remark = $('#facebox textarea.remark').val();
			if(remark) value['remark'] = remark;
			k.dao.addOne(value,function(err,val){
				if(err){}
				else{
					$.facebox.close();
					k.aspect.noty.message(k.conf.table[table]['cn']+'信息新增成功!');
					k.aspect.atcp.auto(val._id,table);
					setTimeout(function() {
						$('#layout div.'+table+' div.kc-manage-box button').click();
					}, 1);
				}
			});
			
		},
		modify:function(id){
			var pn = k.frame.current_plugin,key;
			var box = '#layout div.'+pn,value=k.cache.get(id);
			var html='',key,name;
			for(key in k.conf.table[pn]['cols']){
				if(name = k.conf.table[pn]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[pn].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" value="'+value.name+'" /><input value="'+(value.name_py || '')+'" class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
					}else{
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
							<input class="'+key+'" value="'+(value[key] ||'')+'" /></div>';
					}
				} 
			}
			$.facebox(html+' \
					<div class="fb-input-wrapper"> \
					<label>分类：</label><select style="width:152px;" class="mold"></select><select style="width:152px;margin-left:3px;" class="classify"></select></div> \
					<div class="fb-input-wrapper"> \
					<label>备注：</label> \
					<textarea class="remark" maxlength="120">'+(value.remark ||'')+'</textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.update('+value._id+')">修改</button> \
			</div>');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),pn,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),pn,'b0n');
			var classify=k.cache.setup(pn+'_classify') || {value:''};
			if(value.mold && classify.value[value.mold] && classify.value[value.mold].v) $('#facebox select.mold').val(value.mold);
			else $('#facebox select.mold').val('n');
			if(value.classify && classify.value[value.classify] && classify.value[value.classify].v) $('#facebox select.classify').val(value.classify);
			else $('#facebox select.classify').val('n');
			$('#facebox div.title').html('修改'+k.conf.table[pn]['cn']+'信息');
			if(k.conf.table[pn].py){
				$('#facebox input.name').change(function(){
					$('#facebox input.pinyin').val(u.pinyin.getSZM($(this).val()));
				});
			}
		},
		update:function(id){
			var old=k.cache.get(id);
			var table=k.frame.current_plugin,val;
			var value={_id:id,tn:table},key,old_name=old.name;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'mold' || key == 'classify'){
						val = $('#facebox select.'+key).val();
						if(val === 'n'){
							if(old[key]) value[key] = '';
						}else{
							if(val != old[key]) value[key] = val;
						}
					}else if(key!='ct' && key!='lm'){
						val = $('#facebox input.'+key).val().trim();
						if(old[key]){
							if(old[key] !== val) value[key] = val;
						}else if(val) value[key] = val;
					}
				} 
			}
			if(value['name']){
				if(k.cache.name_cache[table][value['name']] && k.cache.name_cache[table][value['name']] !== id){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能重复!');
					return;
				}
			}else if(value['name']===''){
				k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能为空!');
				return;
			}
			if(k.conf.table[table].py) value['name_py']=$('#facebox input.pinyin').val().trim();
			var remark = $('#facebox textarea.remark').val();
			if(old['remark']){
				if(old['remark'] !== remark) value['remark'] = remark;
			}else if(remark) value['remark'] = remark;
			k.dao.updOne(value,function(err,val){
				if(err){}
				else {
					$.facebox.close();
					k.aspect.noty.message(k.conf.table[table]['cn']+'信息修改成功!');
					if(value['name']) k.cache.name_cache[table][old_name] = 0;
					k.aspect.atcp.auto(val._id,table);
					setTimeout(function() {
						$('#layout div.'+table+' div.kc-manage-box button').click();
					}, 1);
				}
			});
		},
		create:function(table){
			var html='',key,name;
			for(key in k.conf.table[table]['cols']){
				if(name = k.conf.table[table]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[table].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" /><input class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
					}else{
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
							<input class="'+key+'" /></div>';
					}
				}
			}
			$.facebox(html+' \
					<div class="fb-input-wrapper"> \
					<label>分类：</label><select style="width:154px;" class="mold"></select><select style="width:154px;margin-left:3px;" class="classify"></select></div> \
					<div class="fb-input-wrapper"> \
					<label>备注：</label> \
					<textarea class="remark" maxlength="120"></textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.insert(\''+table+'\')">提交</button> \
			</div>');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),table,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),table,'b0n');
			$('#facebox div.title').html('<a href="#/'+k.conf.table[table]['nav']+'/'+table+'">'+k.conf.table[table]['cn']+'管理</a> > 新增'+k.conf.table[table]['cn']+'信息');
			if(k.conf.table[table].py){
				$('#facebox input.name').change(function(){
					$('#facebox input.pinyin').val(u.pinyin.getSZM($(this).val()));
				});
			}
		},
		init:function(conf){
			//初始内容
			var pn = k.frame.current_plugin,key;
			var box = '#layout div.'+pn;
			$('#layout div.lay-main').append(' \
				<div hidden class="'+pn+'"> \
		          <div class="kc-manage-box"> \
					<input class="s-input" onkeyup="kaidanbao.aspect.manage.search_enter(event);" /><select class="s1"></select><select class="s2"></select><button class="s-btn">搜索</button> \
					<div><section class="func-a"> \
						<span class="create">新增</span> \
						<span class="classify">分类</span> \
				</section><section class="summary-box"></section></div> \
				  </div> \
				  <table class="kc-manage-list"> \
				     <tr><th title="下载表格" class="num"><svg class="down" version="1.1" viewBox="0 -70 1034 1034"><path d="M512 384l256 256h-192v256h-128v-256h-192zM744.726 488.728l-71.74-71.742 260.080-96.986-421.066-157.018-421.066 157.018 260.080 96.986-71.742 71.742-279.272-104.728v-256l512-192 512 192v256z"></path></svg></th> \
				         <th class="remark">备注</th></tr> \
				  </table><br /> \
				</div>');
			//extra
			if(conf.extra) conf.extra();
			//1，确定表名，字段
			if(!conf.table) conf.table=pn;
			//根据字段，填充th
			k.aspect.manage.th_fill($(box+' table.kc-manage-list th.remark'),conf.table);
			//选择框
			if(conf.select){
				conf.select();
			}else{
				k.aspect.manage.selectClassifyRefresh($(box+' select.s1'),conf.table,'aan');
				k.aspect.manage.selectClassifyRefresh($(box+' select.s2'),conf.table,'ban');
			}
			//新增按钮
			if(conf.create === 'noop'){
				$(box+' div.kc-manage-box section.func-a span.create').remove();
			}else{
				if(conf.create){
					$(box+' div.kc-manage-box section.func-a span.create').click(conf.create);
				}else{
					$(box+' div.kc-manage-box section.func-a span.create').click(function(){
						kaidanbao.aspect.manage.create(conf.table);
					});
				}
			}
			//classify管理
			if(conf.classify === 'noop'){
				$(box+' div.kc-manage-box section.func-a span.classify').remove();
			}else{
				if(conf.classify){
					conf.classify();
				}else{
					$(box+' div.kc-manage-box section.func-a span.classify').click(function(){
						var key,clazz = k.cache.setup(conf.table+'_classify');
						$.facebox('<div class="classify"> \
							<fieldset> \
				              <legend>类型</legend> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset> \
							<fieldset style="margin-left:10px;"> \
				              <legend>类别</legend> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset></div>');
						$('#facebox div.title').html(k.conf.table[conf.table]['cn']+'分类管理');
						$('#facebox div.footer').html('<button class="ensure">保存分类</button>');
						if(clazz){
							for(key in clazz.value){
								$('#facebox div.classify fieldset:eq('+(key[0]=='a'?0:1)+') input').eq(key.substring(1)).val(clazz.value[key].v).attr('placeholder',clazz.value[key].old||'');
							}
						}
						$('#facebox div.footer .ensure').click(function(){
							var c1 = $('#facebox div.classify fieldset:eq(0) input');
							var c2 = $('#facebox div.classify fieldset:eq(1) input');
							var classify=clazz.value || {};
							for(var i =0;i<12;i++){
								if(!classify['a'+i]) classify['a'+i]={};
								classify['a'+i].v=c1.eq(i).val();
								if(c1.eq(i).val()) classify['a'+i].old=c1.eq(i).val();
								
								if(!classify['b'+i]) classify['b'+i]={};
								classify['b'+i].v=c2.eq(i).val();
								if(c2.eq(i).val()) classify['b'+i].old=c2.eq(i).val();
							}
							if(clazz){
								k.dao.updOne({tn:'setup',_id:clazz._id,value:classify});								
							}else{
								k.dao.addOne({type:conf.table+'_classify',tn:'setup',value:classify});
							}
						});
					});
				}
			}
			var s_btn   = $(box+' div.kc-manage-box button.s-btn');
			var s1      = $(box+' div.kc-manage-box select.s1');
			var s2      = $(box+' div.kc-manage-box select.s2');
			var s_input = $(box+' .kc-manage-box input.s-input');
			//搜索
			$(box+' div.kc-manage-box button.s-btn').click(function(e){
				if(conf.search){
					conf.search();
				}else{
					k.aspect.manage.search({
		box:box,table:conf.table,notice:conf.notice,count:conf.count,modify_name:conf.modify_name
					});
				}
			});
			s1.change(function(e){
				s_btn.click();
			});
			s2.change(function(e){
				s_btn.click();
			});
			s_btn.click();
			$(box+' svg.down').click(function(){
				u.file.tableToExcel('<table>'+$(box+' table.kc-manage-list').html()+'</table>',
						$('div.lay-left:not([hidden]) li.selected a').html()+'-'+$(box+' div.kc-manage-box select.s1 option:selected').html().replace('&lt;','[').replace('&gt;',']')+'-'+$(box+' div.kc-manage-box select.s2 option:selected').html().replace('&lt;','[').replace('&gt;',']')+(s_input.val()?('-'+s_input.val()):''));
			});
		},
	}
})(window.kaidanbao);
/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var clodop;
	var ad=function(){
		$('#print td.color').html($('#print td.color').html()+'（开单宝：www.kaidan.me）');
	}
	var print=function(select){
		if(!clodop){
			//初始化C-LODOP
			if(window.getCLodop && typeof window.getCLodop == 'function'){ 
//					if(window.location.host === 'kaidanbao.cn'){//kaidanbao.cn
//						clodop = window.getCLodop();
//						clodop.SET_LICENSES("","74A38B4E525F7B4F72F7AAC816C77A87","C94CEE276DB2187AE6B65D56B3FC2848","");
//					}else if(window.location.host === 'kaidan.me'){//kaidan.me
				clodop = window.getCLodop();
				clodop.SET_LICENSES("","BFEED6994BBE99CEEC3AEFCA727BD890","C94CEE276DB2187AE6B65D56B3FC2848","");
//					}
			}
		}
		if(clodop){
			clodop.PRINT_INIT("kdb2_print");
			clodop.SET_PRINT_PAGESIZE (1,2100,1400,"");
			clodop.ADD_PRINT_HTM('1mm','1mm','100%','100%',document.getElementById("print").innerHTML);
			if(select) clodop.PRINTA();
			else clodop.PRINT();
			return true;
		}
	}
	var prepare=function(bill,msg){//打印之前执行
		if(bill && bill.payamount) msg = '定金：'+bill.payamount+' 元';
		var pn  = (bill||{}).tn || k.frame.current_plugin,box = '#layout div.'+pn;
		var setting,
		title = '开单宝有限公司销售单',
//		tips = '唯一官网：kaidanbao.cn，唯一淘宝店：kaidan.taobao.com，微信：kaidanbao-cn，QQ：445324773',
		tips = '主营：T5/T8日光灯外壳配件及支架、铝基板、成品。地址：古镇曹一乐昌西路18号。QQ：12345678901234567<br />电话：0760-23661072，18898484018。古镇农行账户：6228480108990910078 王伟',
		notice = '注：以上货物当面点清，签字即视为结算凭证；对质量有意见请在7天内提出书面异议，过期视为默认。',
		color = '（白单存根，红单客户，蓝单回单，黄单结款）';
		if(bill) {
			setting=k.cache.setup(bill.tn+'-print');
		}else{
			if(pn === 'salebilling') setting=k.cache.setup('salebill-print');
			else if(pn === 'bringbilling') setting=k.cache.setup('bringbill-print');
		}
		if(setting){
			title = setting.title;
			tips = setting.tips;
			notice = setting.notice;
			color = setting.color;
		}
		var i=0,page='<div class="tit" contenteditable="true">'+title+'</div> \
		<div style="text-align:left;" class="tips" spellcheck="false" contenteditable="true">'+tips+'</div> \
		<table><tr><td colspan="7" class="top">';
		if(pn==='salebilling' || pn==='salebill'){
			page+='<div>客户：'+(bill?(k.cache.get(bill.customer_id).name):$(box+' input.customer').val())+'</div> \
			<div>销售员：'+(bill?(k.cache.get(bill.saler_id).name || ''):$(box+' input.saler').val())+'</div>';
		}
		if(pn==='bringbilling' || pn==='bringbill'){
			page+='<div>供应商：'+(bill?k.cache.get(bill.supplier_id).name:$(box+' input.supplier').val())+'</div> \
			<div>采购员：'+(bill?(k.cache.get(bill.buyer_id).name || ''):$(box+' input.buyer').val())+'</div>';
		}
		page+='<div>单号：'+(bill?bill.number:$(box+' input.number').val())+'</div><tr><th>商品名称</th><th>规格</th><th>单位</th><th>数量</th><th>售价</th><th>金额</th><th>备注</th></tr>';
		for(i=0;i<9;i++){
			if(!bill || (bill && bill.detail[i])){
//				<td class="num">'+(i+1)+ '</td> \
				page+='<tr> \
					<td class="name">'+(bill?(k.cache.get(bill.detail[i][0]).name || k.cache.get(bill.detail[i][0]).number):$(box+' td.p_name input').eq(i).val())+'</td> \
					<td class="spec">'+(bill?bill.detail[i][1]:$(box+' td.p_spec').eq(i).html())+'</td> \
					<td class="unit">'+(bill?(k.cache.get(bill.detail[i][0]).unit || ''):$(box+' td.p_unit').eq(i).html())+'</td> \
					<td class="count">'+(bill?bill.detail[i][2]:$(box+' td.count').eq(i).html())+'</td> \
					<td class="price">'+(bill?bill.detail[i][3]:$(box+' td.p_price').eq(i).html())+'</td> \
					<td class="amount">'+(bill?bill.detail[i][4]:$(box+' td.amount').eq(i).html())+'</td> \
					<td class="remark">'+(bill?bill.detail[i][5]:$(box+' td.remark').eq(i).html())+'</td></tr>';
			}else{
				page+='<tr><td class="name"></td><td class="spec"></td> \
					<td class="unit"></td><td class="count"></td><td class="price"></td> \
					<td class="amount"></td><td class="remark"></td></tr>';
			}
		}
		page+='<tr><td colspan="3" class="dx">'+(bill?('合计：'+u.DX(bill.amount)):$(box+' td.dx').html())+'</td> \
		<td class="count-sum">'+(bill?bill.count:$(box+' td.count-sum').html())+ '</td> \
		<td></td><td class="amount-sum">'+(bill?bill.amount:$(box+' td.amount-sum').html())+'</td><td class="remark">'+(msg || '')+'</td></tr> \
		<tr><td colspan="7" class="notice" contenteditable="true">'+notice+'</td></tr> \
		<tr><td colspan="7" class="color" contenteditable="true">'+color+'</td></tr></table> \
		<div style="text-align:left;" class="man"> \
		<div>开单员：'+(bill?(k.cache.get(bill.order_id).name || ''):$(box+' input.order').val())+'</div> \
		<div>出纳员：'+(bill?(k.cache.get(bill.cashier_id).name || ''):$(box+' input.cashier').val())+'</div> \
		<div>送货经手人：</div> \
		<div>收货经手人：</div> \
		</div>';
		$('#print div.print').html(page);
		//设置打印页面css
		var boxWidth='202mm',fs = '4mm';
		$('#print td,#print th').css('height','6mm').css('text-align','center').css('border','1px solid #000').css('padding','0.3mm 1mm');
		$('#print th').css('font-weight','normal');
		$('#print table').css('width',boxWidth).css('border-collapse','collapse');
		$('#print td.top div').css('width','33%').css('float','left');
		$('#print td.top,#print td.color,#print td.notice').css('text-align','left');
		
		$('#print .print').find('*').css('font-size',fs).css('font-family','宋体').css('line-height','1');
		$('#print td.name').css('width','60mm').css('text-align','left');
		$('#print td.spec').css('width','15mm');
		$('#print td.unit').css('width','10mm');
		$('#print td.count').css('width','15mm');
		$('#print td.price').css('width','15mm');
		$('#print td.amount').css('width','20mm');
		$('#print td.remark').css('width','60mm').css('text-align','left');
		$('#print td.dx').css('text-align','left');
		
		$('#print .print > div').css('width',boxWidth).css('float','left');
		$('#print div.tit').css('margin-bottom','2mm').css('font-size','8mm').css('text-align','center').css('letter-spacing','1mm').css('font-family','Microsoft Yahei').css('font-weight','bold');
		$('#print div.tips').css('margin-bottom','2mm');
		$('#print div.man').css('margin-top','2mm');
		$('#print div.man div').css('width','23%').css('float','left');
	}
	k.aspect.print={ad:ad,prepare:prepare,act:print,
		facebox:function(select){
			$.facebox.close();
			setTimeout(function() {
				ad();print(select);
			}, 600);
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.statement={
		view_bill:function(tn,id){
			k.dao.get(tn||'salebill',id,function(bill){
				if(!bill) return;
				k.aspect.print.prepare(bill);
				k.aspect.noty.confirm($('#print').html(),function(){
					k.aspect.noty.confirm_close();
				},true,0,'770px');
			});
		},
		view:function(id){
			var customer=k.cache.get(id),bill,i=0,total=0,count,amount,sd,sds=[],month='a',type='s',number;
			var table_list=function(){
				i=0;total=0;
				var table = '<tr><th class="chk" title="全选"><input data-bid="bid" type="checkbox" id="checkbox_a" hidden '+(type==='s'?'':'disabled="disabled"')+' class="chk_1 first" /><label for="checkbox_a"></label></th><th>订单号</th><th>总额</th><th>已付</th><th>状态</th></tr>';
				for(j in k.cache.dates.mt){
					sd = 's'+k.cache.dates.mt[j];
					if(month==='a' || month===sd){
						if(customer[sd] && customer[sd]!=='x'){
							for(var bid in customer[sd]){
								bill = customer[sd][bid];
								if(bill[3]!=='x'){
									table += ('<tr'+(i%2?' class="opp"':'')+'><td class="chk"><input data-bid="'+bid+'" type="checkbox" id="checkbox_a'+(++i)+'" hidden class="chk_1 list" /><label for="checkbox_a'+i+'"></label></td><td><span onclick="kaidanbao.plugin.statement.view_bill(null,'+bid.substring(1)+')">'+
											bill[0]+'</span></td><td>'+bill[1]+'</td><td>'+
											(bill[2]||0)+'</td><td>未结清</td></tr>');
									if(bill[3]!=='d') total +=bill[1];
									if(bill[2]) total -= bill[2];
								}
							}
							sds.push(sd);
						}
					}
				}
				return table;
			}
			$.facebox('<table class="list">'+table_list()+'</table><table class="fix"> \
					<tr><td>选择订单：</td><td class="count">0 / '+i+'</td><td>收款金额：</td><td><input class="amount" placeholder="'+total.toFixed(2)+'" /></td><td>出纳员：</td><td><input class="cashier" type="search" /></td></tr> \
					<tr><td>收款账户：</td><td><select class="account"></select></td><td>对账月份：</td><td><select class="month"><option value="a">所有月份</option></select></td> \
					<td>操作类型：</td><td><select class="type"><option value="s">选择结清</option><option value="z">追加定金</option></select></td></tr><table>');
			$('#facebox div.title').html('客户对账单：<span style="color:#078;">'+customer.name+' ￥'+total.toFixed(2)+'</span>');
			$('#facebox div.footer').html('<button class="ensure">确认收款</button>');
			$('#facebox div.footer .ensure').click(function(){
				var payamount=$('#facebox input.amount').val().trim();
				if(!u.is_float(payamount)){
					k.aspect.noty.message('收款金额格式错误！');
					return;
				}
				payamount = parseFloat(payamount);
				if(payamount==0) {
					k.aspect.noty.message('收款金额不能为零！');
					return;
				}
				if(!$('#facebox input.cashier').attr('data-id')){
					k.aspect.noty.message('出纳员不能为空！');
					return;
				}
				//先遍历已选择的订单
				var checked_bill={},month=$('#facebox select.month').val();
				$('#facebox input.list').each(function(i){
					if($('#facebox input.list').eq(i).prop('checked')) {
						checked_bill[$('#facebox input.list').eq(i).attr('data-bid')]=1;
					}
				});
				if($('#facebox td.count').html()[0] =='0'){
					k.aspect.noty.message('未选择任何订单！');
					return;
				}
				var up={tn:customer.tn,_id:customer._id},upsd={};
				for(var i=0;i<24;i++){ //对账不超过24个月
					sd='s'+k.cache.dates.mt[24-i-1];upsd[sd]={};
					if(customer[sd] && customer[sd]!=='x'){
						if(month==='a' || month ===sd){
							if(type === 's'){
								upsd[sd]['nonechecked']=true;
								upsd[sd]['allchecked']=true;
								for(var bid in customer[sd]){
									if(checked_bill[bid]) {
										if(upsd[sd]['nonechecked']) up[sd] = customer[sd];
										upsd[sd]['nonechecked']=false;
										up[sd][bid][3]='x';
									}else{
										if(customer[sd][bid][3]!=='x') upsd[sd]['allchecked']=false;
									}
								}
								if(upsd[sd]['allchecked'] && (i < 23)) {
									up[sd]='x';
								}
							}else{
								for(var bid in customer[sd]){
									if(checked_bill[bid]) {
										up[sd]         = customer[sd];
										up[sd][bid][2] = up[sd][bid][2] || 0;
										up[sd][bid][2]+= parseFloat($('#facebox input.amount').val().trim());
										number = up[sd][bid][0];
										break;
									}
								}
							}
						}
					}
				}
				k.dao.updOne(up,function(err,r){
					if(r){
						k.aspect.noty.message('收款成功！');
						$.facebox.close();
						$('#layout div.statement div.kc-manage-box button').click();
						var moneyflow={tn:'moneyflow'};
						moneyflow.amount     = payamount;
						moneyflow.cashier_id = parseInt($('#facebox input.cashier').attr('data-id'));
						if(customer.tn==='customer'){
							moneyflow.account_r  = parseInt($('#facebox select.account').val());
							moneyflow.type='xs';
							moneyflow.aper_id=customer._id;
						}else{
							moneyflow.account_p  = parseInt($('#facebox select.account').val());
							moneyflow.type='cg';
							moneyflow.arer_id=customer._id;
						}
						moneyflow.number='CN-'+k.aspect.manage.get_number();
						if(type==='z') {
							moneyflow.type = 'z';
							moneyflow.bill_number = number;
						}
						k.dao.addOne(moneyflow);
					}
				});
			});
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
			for(var i in sds){
				$('#facebox select.month').append('<option value="'+sds[i]+'">'+sds[i].replace('s','20')+'</option>');
			}
			var month_change=function(){
				month = $('#facebox select.month').val();
				$('#facebox table.list').html(table_list());
				$('#facebox td.count').html('0 / '+i);
				$('#facebox input.amount').val('');
				
				$('#facebox input.first').change(function(){
					var checked = $('#facebox input.first').prop('checked');
					if(checked) {
						$('#facebox input.first').next().css('background-color','#e7eff5');
						$('#facebox td.count').html(i+' / '+i);
						$('#facebox input.amount').val(total.toFixed(2));
					}else{
						$('#facebox input.first').next().css('background-color','#fff');
						$('#facebox td.count').html('0 / '+i);
						$('#facebox input.amount').val('');
					}
					$('#facebox input.list').prop('checked',checked);
				});
				$('#facebox input.list').change(function(){
					if(type==='s'){
						count=0;amount=0;
						$('#facebox input.list').each(function(i){
							if($('#facebox input.list').eq(i).prop('checked')) {
								count++;
								var am = $('#facebox table.list tr:eq('+(i+1)+') td:eq(2)').html();
								var pm = $('#facebox table.list tr:eq('+(i+1)+') td:eq(3)').html();
								amount +=(parseFloat(am)-parseFloat(pm));
							}
						});
						if($('#facebox input.first').prop('checked') && (count !== i)) {
							$('#facebox input.first').next().css('background-color','#fff');
						}
						$('#facebox td.count').html(count+' / '+i);
						$('#facebox input.amount').val(amount?amount.toFixed(2):'');
					}else{
						$('#facebox input.list').each(function(i){
							$('#facebox input.list').eq(i).prop('checked',false);
						});
						$(this).prop('checked',true);
						$('#facebox td.count').html('1 / '+i);
					}
				});
			}
			$('#facebox input.cashier').autocomplete({
				minChars: 0,
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
				},
				onSearchComplete:function(q,s){
					$(this).removeAttr('data-id');
				},
			});
			$('#facebox select.month').change(month_change);
			$('#facebox select.type').change(function(){
				type = $(this).val();
				if(type==='s'){
					$('#facebox th.chk input').removeAttr('disabled');
				}else{
					$('#facebox input.first').prop('checked',false).attr('disabled','disabled');
					$('#facebox input.first').next().css('background-color','#fff');
					$('#facebox td.count').html('0 / '+i);
					$('#facebox input.amount').val(0);
					$('#facebox input.list').each(function(i){
						$('#facebox input.list').eq(i).prop('checked',false);
					});
				}
			});
			month_change();
		},
		release:function(){ $('#layout div.statement table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.statement button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.statement';
			k.aspect.manage.init({create:'noop',classify:'noop',
				search:function(){
					$(box+' table.kc-manage-list tr.list').remove();
					var i,j,rowspan,len,v,t_m={},t_a,c_m={},p_m={},c_a,count=0,amount=0,sd,bid,n=0,m=0,map={};
					var s1 = $(box+' select.s1').val();
					for(i in k.cache.fixed_page[s1]){
						len=0;t_a=0;c_a=0;
						if(map['i'+k.cache.fixed_page[s1][i]]) continue;
						else map['i'+k.cache.fixed_page[s1][i]]=1;
						
						v=k.cache.get(k.cache.fixed_page[s1][i]);
						t_m['i'+v._id]={},p_m['i'+v._id]={},c_m['i'+v._id]={};
						for(j in k.cache.dates.mt){
							sd = 's'+k.cache.dates.mt[j];
							if(v[sd] && v[sd]!=='x'){
								t_m['i'+v._id][sd]=0,p_m['i'+v._id][sd]=0,c_m['i'+v._id][sd]=0;
								for(bid in v[sd]){
									if(v[sd][bid][3]!=='x'){
										t_a     +=(parseFloat(v[sd][bid][1])-parseFloat(v[sd][bid][2] || 0));
										c_a     += 1;
										t_m['i'+v._id][sd] +=parseFloat(v[sd][bid][1]);
										p_m['i'+v._id][sd] +=parseFloat(v[sd][bid][2] || 0);
										c_m['i'+v._id][sd] += 1;
									}
								}
								if(c_m['i'+v._id][sd]>0) len++;
							}
						}
						v.len = len;v.count=c_a;v.amount=t_a;
					}
					map={};
					//排序
					var asc  = $(box +' th.sort.asc').attr('data-sort');
					var desc = $(box +' th.sort.desc').attr('data-sort');
					if(asc){
						k.cache.fixed_page[s1].sort(function(a,b){
							return k.cache.get(a)[asc] < k.cache.get(b)[asc]?1:-1;
						});
					}else if(desc){
						k.cache.fixed_page[s1].sort(function(a,b){
							return k.cache.get(a)[desc] > k.cache.get(b)[desc]?1:-1;
						});
					}
					for(i in k.cache.fixed_page[s1]){
						if(map['i'+k.cache.fixed_page[s1][i]]) continue;
						else map['i'+k.cache.fixed_page[s1][i]]=1;
						
						v=k.cache.get(k.cache.fixed_page[s1][i]);
						if(v.len == 0) continue;
						n++;count+=v.count;amount+=v.amount;
						rowspan='</td><td rowspan="'+v.len+'"><span title="查看" onclick="kaidanbao.plugin.statement.view('+v._id+')">'+k.cache.get(v._id).name+'</span></td><td rowspan="'+v.len+'">'+v.count+'</td><td rowspan="'+v.len+'">'+v.amount.toFixed(2)+'</td><td rowspan="'+v.len+'">'+u.date.getTimeFormat(v.lm,'d');
						for(j in k.cache.dates.mt){
							sd = 's'+k.cache.dates.mt[j];
							if(v[sd] && v[sd]!=='x' && c_m['i'+v._id][sd]>0){
								$(box+' table.kc-manage-list').append(
										'<tr class="list '+(n%2===0?'opp':'')+'"><td>'+(++m)+rowspan
										+'</td><td>'+k.cache.dates.m_t[j]
										+'</td><td>'+c_m['i'+v._id][sd]
										+'</td><td>'+t_m['i'+v._id][sd].toFixed(2)
										+'</td><td>'+p_m['i'+v._id][sd].toFixed(2)
										+'</td><td class="remark"></td></tr>');
								rowspan='';op='';
							}
						}
					}
					$(box+' section.summary-box').html('总计：'+count+' 单，'+amount.toFixed(2)+' 元');
				},select:function(){
					$(box+' select.s1').append('<option value="customer">客户对账</option><option value="supplier">供应商对账</option>');
					$(box+' select.s2').append('<option>所有月份</option>');
					$(box+' input').attr('placeholder','按客户名称搜索');
				}
			});
		}
	}
	p.moneyflow={
		insert:function(){
			var account_p=$('#facebox select.account-p').val(),
			    account_r=$('#facebox select.account-r').val(),
			    remark=$('#facebox textarea.remark').val(),
			    type=$('#facebox select.type').val(),
			    mf={tn:'moneyflow',number:$('#facebox input.number').val(),amount:$('#facebox input.amount').val(),cashier_id:$('#facebox input.cashier').attr('data-id'),type:type};
			if(remark) mf.remark=remark;
			if(mf.amount) mf.amount=parseFloat(mf.amount);
			if(type === 'os'){
				mf.account_r=account_r;
			}else if(type === 'gz' || type === 'fz' || type === 'sf' || type === 'oz'){
				mf.account_p=account_p;
			}else if(type === 'zz'){
				mf.account_r=account_r;
				mf.account_p=account_p;
			}
			k.dao.addOne(mf,function(){
				$.facebox.close();
				$('#layout div.moneyflow div.kc-manage-box button').click();
			});
		},
		create:function(){
			$.facebox(' \
				<div class="fb-input-wrapper"> \
				<label>流水号：</label><input disabled="disabled" class="number" /></div> \
				<div class="fb-input-wrapper"> \
				<label>类型：</label><select class="type"><option value="os">其他收入</option><option value="oz">其他支出</option><option value="zz">内部转账</option></select></div> \
				<div class="fb-input-wrapper hide account-p" hidden> \
				<label>付款账户：</label><select class="account-p account" /></div> \
				<div class="fb-input-wrapper hide account-r"> \
				<label>收款账户：</label><select class="account-r account" /></div> \
				<div class="fb-input-wrapper"> \
				<label>金额：</label><input placeholder="必填" class="amount" /></div> \
				<div class="fb-input-wrapper"> \
				<label>出纳员：</label><input type="search" placeholder="必填" class="cashier" /></div> \
				<div class="fb-input-wrapper"> \
				<label>摘要：</label><textarea class="remark" maxlength="120"></textarea></div> \
				<div class="fb-input-wrapper"> \
				<label>&nbsp;</label> \
				<button onclick="kaidanbao.plugin.moneyflow.insert()">提交</button> \
			</div>');
			$('#facebox div.title').html('<a href="#/fi/moneyflow">出纳流水</a> > 新增出纳信息');
			$('#facebox input.number').val('CN-'+k.aspect.manage.get_number());
			var type,i,account;
			$('#facebox select.type').change(function(e){
				type = $('#facebox select.type').val();
				$('#facebox div.hide').attr('hidden','hidden');
				if(type === 'os'){
					$('#facebox div.account-r').removeAttr('hidden');
				}else if(type === 'oz'){
					$('#facebox div.account-p').removeAttr('hidden');
				}else if(type === 'zz'){
					$('#facebox div.account-p').removeAttr('hidden');
					$('#facebox div.account-r').removeAttr('hidden');
				}
			});
			$('#facebox input.cashier').autocomplete({
				minChars: 0,
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
		        },
		        onSearchComplete:function(q,s){
		        	$(this).removeAttr('data-id');
		        },
			});
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
		},
		release:function(){ $('#layout div.moneyflow table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.moneyflow button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.moneyflow';
			k.aspect.manage.init({create:kaidanbao.plugin.moneyflow.create,classify:'noop'
				,search:function(){ total=0;
//					$(box+' table.kc-manage-list th.oprate').remove();
					$(box+' table.kc-manage-list tr.list').remove();
					$(box+' table.kc-manage-list th.remark').html('摘要');
					$(box+' input').attr('placeholder','搜索流水号、收款方、付款方、出纳员');
					var s1=$(box+' select.s1').val(),i=0,amount=0;
					var s2=$(box+' select.s2').val();
					k.dao.queryDynamicByMonth('moneyflow',s2,function(finish){
						if(finish) {
							var v1=k.cache.dynamic['moneyflow'][s2],v;
							for(var idx in v1){ v = v1[idx];
//								if(s1 !=='a' && v.type !== s1) return;
								amount+=v.amount;
								$(box+' table.kc-manage-list').append(
										'<tr class="list '+(++i%2===0?'opp':'')+'"><td>'+i
										+'</td><td>'+v.number
										+'</td><td>'+(v.aper_id?k.cache.get(v.aper_id).name:((v.type!=='xs' && v.type!=='os' || v.type==='zz')?'[ '+(v.account_p?k.cache.get(v.account_p).name:'')+' ]':''))
										+'</td><td>'+(v.arer_id?k.cache.get(v.arer_id).name:((v.type==='xs' || v.type==='os' || v.type==='zz')?'[ '+(v.account_r?k.cache.get(v.account_r).name:'')+' ]':''))
										+'</td><td>'+k.cache.get(v.cashier_id).name
										+'</td><td>'+v.amount
										+'</td><td>'+v.type
										+'</td><td class="remark">'+(v.remark || '')
										+'</td></tr>');
							}
							$(box+' section.summary-box').html('总计 '+i+' 条流水，总金额 '+amount.toFixed(2)+' 元');
						}
					});
				},select:function(){
					$(box+' select.s1').append('<option value="a"><所有类型></option>');
					for(var i in k.cache.dates.m_t){
						if(i<=k.cache.sign.month_length) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
					}
				}
			});
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var code_sended = false;
	p.welcome={
		init:function(){
			var box = '#layout div.lay-main .welcome';
			$('#layout div.lay-main').append(' \
				<div hidden class="welcome"> \
					<div class="pan-box chart-box"> \
						<div class="title">欢迎使用开单宝！惜时光，演绎精彩生活。</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box list-box"> \
						<div class="title">在线用户</div> \
						<div class="content"> \
					<table><th class="printer" title="打印机"> \
					<svg version="1.1" viewBox="0 -70 1034 1034"><path d="M256 896h512v-128h-512v128zM960 704h-896c-35.2 0-64-28.8-64-64v-320c0-35.2 28.794-64 64-64h192v-256h512v256h192c35.2 0 64 28.8 64 64v320c0 35.2-28.8 64-64 64zM128 512c-35.346 0-64 28.654-64 64s28.654 64 64 64 64-28.654 64-64-28.652-64-64-64zM704 64h-384v320h384v-320z"></path></svg> \
					</th><th>用户</th></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>lulu</td></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>jinhui-fingal</td></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>jinhui-kaidanbao</td></tr> \
					</table>\
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">登录信息</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">服务信息</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">全屏</div> \
						<svg class="full" version="1.1" viewBox="0 -70 1034 1034"><path d="M1024 960h-416l160-160-192-192 96-96 192 192 160-160zM1024-64v416l-160-160-192 192-96-96 192-192-160-160zM0-64h416l-160 160 192 192-96 96-192-192-160 160zM0 960v-416l160 160 192-192 96 96-192 192 160 160z"></path></svg> \
						<svg hidden class="small" version="1.1" viewBox="0 -70 1034 1034"><path d="M576 512h416l-160 160 192 192-96 96-192-192-160 160zM576 384v-416l160 160 192-192 96 96-192 192 160 160zM448 384.004h-416l160-160-192-192 96-96 192 192 160-160zM448 512v416l-160-160-192 192-96-96 192-192-160-160z"></path></svg> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">安全退出</div> \
						<svg class="exit" version="1.1" viewBox="0 -70 1034 1034"><path d="M640 813.412v-135.958c36.206-15.804 69.5-38.408 98.274-67.18 60.442-60.44 93.726-140.8 93.726-226.274s-33.286-165.834-93.726-226.274c-60.44-60.44-140.798-93.726-226.274-93.726s-165.834 33.286-226.274 93.726c-60.44 60.44-93.726 140.8-93.726 226.274s33.286 165.834 93.726 226.274c28.774 28.774 62.068 51.378 98.274 67.182v135.956c-185.048-55.080-320-226.472-320-429.412 0-247.424 200.578-448 448-448 247.424 0 448 200.576 448 448 0 202.94-134.95 374.332-320 429.412zM448 960h128v-512h-128z"></path></svg> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">微信号</div> \
						<img src="/image/vx.jpg" title="公众号：kaidanme"> \
					</div> \
					<div hidden class="pan-box note-box"> \
						<div class="title">通知公告</div> \
					</div> \
				</div>');
			
			$(box+' svg.full').click(function(){
				var docElm = document.documentElement;
			    if (docElm.requestFullscreen) { docElm.requestFullscreen();
			    }else if (docElm.mozRequestFullScreen) { docElm.mozRequestFullScreen();
			    }else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen();
			    }else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
				$(this).attr('hidden','hidden');
				$(box+' svg.small').removeAttr('hidden');
			});
			$(box+' svg.small').click(function(){
				if (document.exitFullscreen) { document.exitFullscreen();
			    }else if (document.mozCancelFullScreen) { document.mozCancelFullScreen();
			    }else if (document.webkitCancelFullScreen) { document.webkitCancelFullScreen();
			    }else if (document.msExitFullscreen) { document.msExitFullscreen(); }
				$(this).attr('hidden','hidden');
				$(box+' svg.full').removeAttr('hidden');
			});
			$(box+' svg.exit').click(function(){
				k.aspect.noty.confirm('<br /><h1>确定退出？</h1>',function(){
					window.location.href = './';
				});
			});
			$(box+' .note-box:eq(0) .content').html(navigator.userAgent);
		},
	}
	p.usercenter={
		roll:{
			upset:function(ri){
				var td='',opp=0,n=0;
				var json = k.conf.frame;
				//json['p'][m]['sol'][n]['plug'][l]
				var p=json['p'],sol,plug,i,j,m,en,cn;
				for(i=1;i<p.length;i++){
					if(p[i]['sol'].length === 0) continue;
					en=p[i]['en'];cn=p[i]['cn'];
					td += ('<tr'+(opp++%2?'':' class="opp"')+'><td class="grey" rowspan="'+p[i]['sol'].length+'">'+cn+'</td><td class="grey">'+p[i]['sol'][0]['cn']+'</td>');
					sol = p[i]['sol'];
					for(j=0;j<sol.length;j++){
						if(j>0) td+=('<tr'+(opp++%2?'':' class="opp"')+'><td class="grey">'+p[i]['sol'][j]['cn']+'</td>');
						plug=sol[j]['plug'];
						for(m=0;m<plug.length;m++){
							td += ('<td><input data-pn="'+plug[m]['en']+'" type="checkbox" id="checkbox_a'+(++n)+'" hidden class="chk_1 '+plug[m]['en']+'" /><label for="checkbox_a'+n+'"></label>'+plug[m]['cn']+'</td>');
						}
						td+='</tr>';
					}
				}
				$.facebox('名称：<input class="name" style="width:100px;" />，说明：<input class="remark" style="width:200px;" /><br /><br /><table class="frame">'+td+'</table>');
				$('#facebox div.footer').html('<button class="ensure">确定</button>');
				var roll = k.cache.setup('roll'),len=roll.value;
				if(ri){
					//修改
					$('#facebox div.title').html('修改角色');
					var old_plugin = roll['r'+ri].plugin;
					$('#facebox input.chk_1').each(function(i){
						if(old_plugin[$('#facebox input.chk_1').eq(i).attr('data-pn')]) $('#facebox input.chk_1').eq(i).prop('checked','checked');
					});
					$('#facebox input.name').val(roll['r'+ri].name);
					$('#facebox input.remark').val(roll['r'+ri].remark);
				}else{
					//新增
					$('#facebox div.title').html('新增角色');
					len += 1;ri = roll.value;
				}
				$('#facebox div.footer .ensure').click(function(){
					var plugin={};
					var name = $('#facebox input.name').val().trim();
					if(!name) {
						k.aspect.noty.message('角色名称不能为空');
						return;
					}
					$('#facebox input.chk_1').each(function(i){
						if($('#facebox input.chk_1').eq(i).prop('checked')) {
							plugin[$('#facebox input.chk_1').eq(i).attr('data-pn')] = 1;
						}
					});
					var roll_upd = {_id:roll._id,value:len,tn:'setup'};
					roll_upd['r'+ri] = {
							name  : $('#facebox input.name').val(),
							remark: $('#facebox input.remark').val(),
							plugin: plugin
					};
					k.dao.updOne(roll_upd,function(){
						$.facebox.close();
						window.kaidanbao.plugin.usercenter.roll.load();
					});
				});
			},load:function(){
				var box = '#layout div.usercenter';
				//角色
				var roll=k.cache.setup('roll');
				$(box+' .roll-box .content').html('<table><tr><th>名称</th><th>说明</th></tr></table>');
				for(var n=0;n<roll.value;n++){
					var name = roll['r'+n].name;
					if(!roll['r'+n].f){//可修改
						name = '<span onclick="kaidanbao.plugin.usercenter.roll.upset('+n+');">'+name+'</span>';
					}
					$(box+' .roll-box table').append('<tr><td>'+name+'</td><td>'+roll['r'+n].remark+'</td></tr>');
				}
			}
		},
		inc:{
			load:function(){
				var user = k.cache.sign.user;
				$('#layout div.usercenter .inc-info .content').html(
						'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'inc\');">公司简称</span>：'+user.inc+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'mobile\');">安全电话</span>：'+(user.safe_mobile || '')+'<br />'+
						'注册日期：'+u.date.getTimeFormat(user.ct,'d')+'<br />'
				);
			},
			update:function(type){
				var user = k.cache.sign.user;
				var ur = {_id:user._id};
				if(type == 'inc'){
					var inc = $('#facebox input.inc').val().trim();
					if(!u.valid_hanname(inc)) return;
					ur.inc = inc;
				}else if(type=='mobile'){
					var mobile = $('#facebox input.mobile').val().trim();
					var code = $('#facebox input.code').val().trim();
					var password = $('#facebox input.password').val();
					var pwd_local = k.safe.local_pwd(password);
					var local_pwd = k.cache.local()['lp'+user['staff'+k.cache.sign.staff_id].loginname];
					if(!u.valid_mobile(mobile)) return;
					if(pwd_local != local_pwd){
						k.aspect.noty.message('密码错误！');
						return;
					}
					if(code_sended && !code) {
						k.aspect.noty.message('验证码不能为空！');
						return;
					}
					ur.safe_mobile = mobile;
					ur.code = parseInt(code);
				}
				k.net.api('/manage/upduser',ur,function(err,r){
					if(r){
						if(r.obj.mobile){
							code_sended = true;
							k.aspect.noty.message('已发短信至:'+r.obj.mobile);
							$('#facebox button.send-msg').html('已发送').attr('disabled','disabled');
						}else{
							if(inc) window.kaidanbao.plugin.loading.change_inc(inc);
							user.safe_mobile = mobile;
							window.kaidanbao.plugin.usercenter.inc.load();
							k.aspect.noty.message('操作成功！');
							$.facebox.close();
						}
					}
				});
			},
			change:function(type){
				var user = k.cache.sign.user;
				$.facebox(
						'<br /><div class="fb-input-wrapper inc" hidden> \
						<label>公司简称：</label> \
						<input class="inc" maxlength="8" value="'+(user.inc || '')+'" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>旧手机号码：</label> \
						<input disabled="disabled" maxlength="11" value="'+(user.safe_mobile || '(无)')+'" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>新手机号码：</label> \
						<input class="mobile" maxlength="11" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>短信验证码：</label> \
						<input class="code" maxlength="4" style="width:120px;" /><button style="padding:5px;margin-left:2px;" onclick="kaidanbao.plugin.usercenter.inc.update(\''+type+'\');" class="send-msg">发短信</button></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>登录密码：</label> \
						<input class="password" type="password" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.inc.update(\''+type+'\');">提交</button> \
						</div>');
				$('#facebox div.'+type).removeAttr('hidden');
				if(type == 'inc'){
					$('#facebox div.title').html('修改公司名称');
				}else if(type=='mobile'){
					$('#facebox div.title').html('修改手机号码');
				}
			}
		},
		staff:{
			load:function(){
				var staff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
				var roll=k.cache.setup('roll');
				$('#layout div.usercenter .staff-info .content').html(
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'loginname\');">登录账号</span>：'+staff.loginname+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'login-pwd\');">登录密码</span>：******<br />'+
						'<span class="setnick" onclick="kaidanbao.plugin.usercenter.staff.change(\'nick\');">用户昵称</span>：'+(staff.nick || '')+'<br />'+
						'用户角色：'+roll[''+(staff.roll || 'r0')].name+'<br />'+
						'用户状态：正常<br />'+
						'到期日期：'+staff.due+'<br />'
				);
				if(!staff.nick){
					//设置昵称
					$('#layout div.usercenter .staff-info span.setnick').click();
				}
			},
			renewpay:function(){
				var user = k.cache.sign.user,staff=user['staff'+k.cache.sign.staff_id];
				k.aspect.pay({url:'/manage/renewal',
					param:{loginname : staff.loginname}
				},function(r){
					k.aspect.noty.confirm_close();
					k.aspect.noty.message('续期成功！');
					staff.due = r.obj.due;
					$.facebox.close();
					window.kaidanbao.plugin.usercenter.staff.load();
					window.kaidanbao.plugin.usercenter.stafflist.load();
				});
			},
			renewal:function(){
				var user = k.cache.sign.user,staff=user['staff'+k.cache.sign.staff_id];
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>用户名称：</label> \
						<input class="inc" disabled="disabled" value="'+(staff.nick || staff.loginname)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>当前有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+(staff.due)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>续后有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+u.date.getDay(366,staff.due)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.staff.renewpay();">付款</button> \
						</div>');
				$('#facebox div.title').html('用户续费');
			},
			update:function(clazz){
				var oldstaff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
				var staff={_id:oldstaff._id};
				if(clazz=='loginname'){
					staff.loginname=$('#facebox input.loginname').val().trim();
					if(!u.valid_loginname(staff.loginname)) return;
					if(staff.loginname == oldstaff.loginname) return;
				}else if(clazz=='login-pwd'){
					var oldpwd = $('#facebox input.oldpwd').val();
					var newpwd = $('#facebox input.newpwd').val();
					var newpwd1 = $('#facebox input.newpwd1').val();
					var old_pwd_local = k.safe.local_pwd(oldpwd);
					var new_pwd_local = k.safe.local_pwd(newpwd);
					var loc = k.cache.local();
					if(old_pwd_local != loc['lp'+loc.ln]){
						k.aspect.noty.message('旧密码错误！');
						return ;
					}
					if(newpwd != newpwd1){
						k.aspect.noty.message('新密码不一致！');
						return ;
					}
					staff.password=k.safe.up_pwd(new_pwd_local,newpwd);
					staff.old_pwd=k.safe.up_pwd(old_pwd_local,oldpwd);
				}else if(clazz=='nick'){
					staff.nick=$('#facebox input.nick').val().trim();
					if(!u.valid_hanname(staff.nick)) return;
					if(staff.nick == oldstaff.nick) return;
				}
				if(staff.nick){
					var py = u.pinyin.getSZM(staff.nick);
					var clerk_id = k.cache.name_cache.clerk[staff.nick];
					if(clerk_id){//已有职员的名字
						if(clerk_id == oldstaff.bind_clerk){ //未改变
							$.facebox.close();
						}else{//改变绑定职员
							staff.bind_clerk=clerk_id;
							k.net.api('/manage/updstaff',staff,function(err,r){
								if(r){
									u.extend(oldstaff,staff,true);
									window.kaidanbao.plugin.usercenter.staff.load();
									window.kaidanbao.plugin.usercenter.stafflist.load();
									$.facebox.close();
									k.dao.updOne({_id:clerk_id,tn:'clerk',number:k.cache.sign.staff_id,bind_si:k.cache.sign.staff_id});
								}
							});
						}
					}else{
						if(oldstaff.bind_clerk){
							//更新绑定职员
							k.net.api('/manage/updstaff',staff,function(err,r){
								if(r){
									u.extend(oldstaff,staff,true);
									window.kaidanbao.plugin.usercenter.staff.load();
									window.kaidanbao.plugin.usercenter.stafflist.load();
									$.facebox.close();
									k.dao.updOne({tn:'clerk',number:k.cache.sign.staff_id,_id:oldstaff.bind_clerk,name:staff.nick,name_py:py});
								}
							});
						}else{
							//新增绑定职员
							k.dao.addOne({tn:'clerk',number:k.cache.sign.staff_id,bind_si:k.cache.sign.staff_id,name:staff.nick,name_py:py},function(err,r){
								staff.bind_clerk = r._id;
								k.net.api('/manage/updstaff',staff,function(err,r){
									if(r){
										u.extend(oldstaff,staff,true);
										window.kaidanbao.plugin.usercenter.staff.load();
										window.kaidanbao.plugin.usercenter.stafflist.load();
										$.facebox.close();
									}
								});
							});
						}
					}
				}else{
					k.net.api('/manage/updstaff',staff,function(err,r){
						if(r){
							u.extend(oldstaff,staff,true);
							var loc = k.cache.local();
							if(staff.loginname && staff.loginname != loc.ln){
								loc['ll'+staff.loginname] = loc['ll'+loc.ln];
								loc['lp'+staff.loginname] = loc['lp'+loc.ln];
								loc['ui'+staff.loginname] = loc['ui'+loc.ln];
								loc['si'+staff.loginname] = loc['si'+loc.ln];
								loc['bi'+staff.loginname] = loc['bi'+loc.ln];
								delete loc['ll'+loc.ln];
								delete loc['lp'+loc.ln];
								delete loc['ui'+loc.ln];
								delete loc['si'+loc.ln];
								delete loc['bi'+loc.ln];
								loc.ln = staff.loginname;
							}
							if(staff.password){
								loc['lp'+loc.ln] = new_pwd_local;
							}
							k.cache.local(loc);
							window.kaidanbao.plugin.usercenter.staff.load();
							$.facebox.close();
						}
					});
				}
			},
			change:function(clazz){
				var oldstaff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
				$.facebox(
						'<br /><div hidden class="fb-input-wrapper loginname"> \
						<label>登录账号：</label> \
						<input class="loginname" value="'+oldstaff.loginname+'" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>旧密码：</label> \
						<input type="password" class="oldpwd" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>新密码：</label> \
						<input type="password" class="newpwd" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>确认密码：</label> \
						<input type="password" class="newpwd1" /></div> \
						<div hidden class="fb-input-wrapper nick"> \
						<label>用户昵称：</label> \
						<input class="nick" value="'+(oldstaff.nick || '')+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.staff.update(\''+clazz+'\');">提交</button> \
						</div>');
				$('#facebox div.'+clazz).removeAttr('hidden');
				if(clazz=='loginname'){
					$('#facebox div.title').html('修改登录账号');
				}else if(clazz=='login-pwd'){
					$('#facebox div.title').html('修改登录密码');
				}else if(clazz=='nick'){
					$('#facebox div.title').html('修改用户昵称');
				}
			}
		},
		stafflist:{
			load:function(){
				var user = k.cache.sign.user,staff=user.staff1;
				$('#layout div.usercenter .staff-list .content').html(
						'<table><tr><th>序</th><th>用户</th><th>角色</th><th>状态</th></tr></table>'
				);
				var roll = k.cache.setup('roll');
				$('#layout div.usercenter .staff-list table').append('<tr><td>1</td><td>'+(staff.nick || staff.loginname)+'</td><td>'+roll['r0'].name+'</td><td>正常</td></tr>');
				for(var si=2; si<=user.staff_len;si++){
					staff = user['staff'+si];
					$('#layout div.usercenter .staff-list table').append(
						'<tr><td>'+si+'</td><td><span>'+(staff.nick || staff.loginname)+'<span></td><td>'+(roll[(staff.roll || 'r0')]).name+'</td><td>正常</td></tr>');
				}
			},
			addpay:function(){
				var loginname = $('#facebox input.loginname').val().trim();
				var password = $('#facebox input.password').val().trim();
				var roll = $('#facebox select.nick').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				k.net.api('/sign/checkloginname',{loginname : loginname},function(err,r1){
					if(r1){
						if(r1 && r1.obj.used){
							k.aspect.noty.message('用户名重复！');
							return;
						}
						var pwd_local = k.safe.local_pwd(password);
						k.aspect.pay({url:'/manage/addstaff',
							param:{ui:k.cache.sign.user._id,loginname:loginname,password:k.safe.up_pwd(pwd_local,password),roll:roll}
						},function(r){
							k.aspect.noty.confirm_close();
							k.aspect.noty.message('新增成功！');
							var staff = r.obj;
							k.cache.sign.user['staff'+staff.si] = staff;
							k.cache.sign.user.staff_len = staff.si;
							k.dao.put('sys',{id:'user',value:k.cache.sign.user});
							window.kaidanbao.plugin.usercenter.stafflist.load();
							$.facebox.close();
						});
					}
				},true);
			},
			addstaff:function(){
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>登录名称：</label> \
						<input class="loginname" /></div> \
						<div class="fb-input-wrapper"> \
						<label>登录密码：</label> \
						<input class="password" type="password" /></div> \
						<div class="fb-input-wrapper"> \
						<label>用户角色：</label> \
						<select class="roll" ><option value="r1">总经理</option></select></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.stafflist.addpay();">确定</button> \
						</div>');
				$('#facebox div.title').html('新增用户');
			},
		},
		init:function(){
			var box = '#layout div.usercenter';
			$('#layout div.lay-main').append(' \
					<div hidden class="usercenter"> \
					<div class="pan-box user-box inc-info"> \
						<div class="title">公司信息</div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box staff-info"> \
						<div class="title">当前用户 - <span onclick="kaidanbao.plugin.usercenter.staff.renewal();">续期</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box staff-list"> \
						<div class="title">用户列表 - <span onclick="kaidanbao.plugin.usercenter.stafflist.addstaff();">新增</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box roll-box"> \
						<div class="title">角色设置 - <span onclick="kaidanbao.plugin.usercenter.roll.upset();">新增</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box"> \
						<div class="title">默认设置</div> \
					</div> \
					<div class="pan-box user-box"> \
						<div class="title">操作日志</div> \
					</div> \
			</div>');
			//公司
			p.usercenter.inc.load();
			//用户
			p.usercenter.staff.load();
			//用户列表
			p.usercenter.stafflist.load();
			//角色
			p.usercenter.roll.load();
		},
	}
	
})(window.kaidanbao);
/**
 * 加载中...
 */
(function(k){
	var u = k.utils;
	var p = k.plugin;
	var addup=function(c){c();};//下面重新定义
	p.loading={
		change_inc:function(inc){
			if(inc) k.cache.sign.user.inc=inc;
			else inc = k.cache.sign.user.inc;
			$('#layout div.lay-top li.home a').html(inc);
			$(document).attr("title",inc+' - kaidan.me');
		},
		init:function(){
			if(k.cache.sign.user_id){//必须先登录
				k.dao.init(function(){
					k.syn.init(function(){
						k.cache.init(function(){
							addup(function(){
								window.kaidanbao.plugin.loading.change_inc();
								//TODO 测试使用
								window.location.hash = '#/home/welcome';
								k.cache.sign.loaded = true;
								k.aspect.noty.close_progress();
//								if(k.cache.sign.session){
//									//联网时，服务器推送
//									k.syn.sse();
//								}
							});
						});
					});
				});
			}else{
				window.location.href = './';
			}
		}
	}
	
	/**
	 * 统计，每次登陆时执行，s1601超过2年的仅保留总值
	 * 1,customer,s1601~s9912，对账{i1:[订单编号,总金额,定金,结款状态]...}从salebill统计
	 * 2,supplier,s1601~s9912，对账{i1:[订单编号,总金额,定金,结款状态]...}从bringbill统计
	 * 3,account,amount[0,1,2,...,11]每个月底余额，0是1月底，...，从salebill,bringbill,moneyflow统计
	 * 			 s1601~s9912，{a0:收入...,b0:支出...,c0:内部转账...},
	 * 5,product,s1601~s9912: 销售采购{s1:销售额,...,b2:采购额,...},从salebill bringbill统计
				 store:[0,1,2,...,11],12月月底库存数
	 */
	var i,d,cid,sid,aid,rid,pid;
	var customer={},supplier={},account={},repository={},product={},monthly={};//i1:统计值
	var up_salebill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd='s'+k.cache.dates.mt[m],srd='sr'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('salebill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//customer对账{i1:[订单编号,总金额,定金,结款状态(d删除,x已付全款,[空]普通签单)]...}
				cid = r.customer_id;
				if(!customer['i'+cid]){ customer['i'+cid]={_id:cid};}
				if(r.settlement === 'q'){
					if(!customer['i'+cid][sd]){ customer['i'+cid][sd]={};}
					if(!customer['i'+cid][sd]['i'+r._id]){ customer['i'+cid][sd]['i'+r._id]=[];}
					customer['i'+cid][sd]['i'+r._id][0]=r.number;
					customer['i'+cid][sd]['i'+r._id][1]=r.amount;
					customer['i'+cid][sd]['i'+r._id][2]=r.payamount;
					customer['i'+cid][sd]['i'+r._id][3]=r.st;
				}
				//account,[0,1,2,...,11]
				aid=r.account_id;
				if(aid){
					//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
					if(!account['i'+aid]){ account['i'+aid]={_id:aid};}
					if(!account['i'+aid][sd]) account['i'+aid][sd]=[0,0,0,0,0,0,0,0];
					if(r.payamount){
						//销售收入
						account['i'+aid][sd][0] +=r.payamount;
					}
				}
				rid=r.repository_id;
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(i in r.detail){
					d = r.detail[i],pid=d[0];//[product_id,spec,count,price,amount,remark,type]
					//repository,p[pid]:[0,1,2,...,11]
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}	
					repository['i'+rid]['p'+pid][mm] -= d[2];
//					 * 5,product,s1601~9912: 销售{i1:销售额,...},从salebill统计
//					 	 sr1601~9912: 销售退货{i1:退货额,...},从salebill统计
					if(!product['i'+pid]){
						product['i'+pid]={_id:pid};
					}
					if(!product['i'+pid][sd]) product['i'+pid][sd]={}
					if(!product['i'+pid][sd]['i'+cid]) product['i'+pid][sd]['i'+cid]=0;
					product['i'+pid][sd]['i'+cid] += d[4];
					if(d[4]<0){ //退货
						if(!product['i'+pid][srd]) product['i'+pid][srd]={}
						if(!product['i'+pid][srd]['i'+cid]) product['i'+pid][srd]['i'+cid]=0;
						product['i'+pid][srd]['i'+cid] += d[4];
					}else if(d[3] != 0 && m<2){ //报价单
						if(!customer['i'+cid]['quotation']) {
							customer['i'+cid]['quotation'] = {};
						}
						customer['i'+cid]['quotation']['i'+pid]=[d[3],d[1]];
					}
				}
			}
		},'next');
	}
	var up_bringbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd='s'+k.cache.dates.mt[m],brd='br'+k.cache.dates.mt[m],bd='b'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('bringbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//supplier对账{i1:[订单编号,总金额,定金,结款状态]...}
				sid=r.supplier_id;
				if(!supplier['i'+sid]){ supplier['i'+sid]={_id:sid};}
				if(r.settlement === 'q'){
					if(!supplier['i'+sid][sd]){ supplier['i'+sid][sd]={};}
					if(!supplier['i'+sid][sd]['i'+r._id]){ supplier['i'+sid][sd]['i'+r._id]=[];}
					supplier['i'+sid][sd]['i'+r._id][0]=r.number;
					supplier['i'+sid][sd]['i'+r._id][1]=r.amount;
					supplier['i'+sid][sd]['i'+r._id][2]=r.payamount;
					supplier['i'+sid][sd]['i'+r._id][3]=r.st;
				}
				//account,[0,1,2,...,11]
				aid = r.account_id;
				if(aid){
					//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
					if(!account['i'+aid]){ account['i'+aid]={_id:aid};}
					if(!account['i'+aid][sd]) account['i'+aid][sd]=[0,0,0,0,0,0,0,0];
					if(r.payamount){
						//采购支出
						account['i'+aid][sd][2] -=r.payamount;
					}
				}
				rid = r.repository_id;
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(i in r.detail){
					d = r.detail[i],pid=d[0];//[product_id,spec,count,price,amount,remark,type]
					//repository,p[pid]:[0,1,2,...,11]
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}	
					repository['i'+rid]['p'+pid][mm] += d[2];
					//5,product,b1601~9912: 采购{i2:采购额,...},从bringbill统计
					//          br1601~9912: 采购退货{i2:退货额,...},从bringbill统计
					if(!product['i'+pid]){
						product['i'+pid]={_id:pid};
						product['i'+pid][sd]={};
					}
					if(!product['i'+pid][bd]) product['i'+pid][bd]={};
					if(!product['i'+pid][bd]['i'+sid]) product['i'+pid][bd]['i'+sid]=0;
					product['i'+pid][bd]['i'+sid] += d[4];
					
					if(d[4]<0){ //退货
						if(!product['i'+pid][brd]) product['i'+pid][brd]={};
						if(!product['i'+pid][brd]['i'+sid]) product['i'+pid][brd]['i'+sid]=0;
						product['i'+pid][brd]['i'+sid] += d[4];
					}else if(d[3] != 0 && m<2){ //报价单
						if(!supplier['i'+sid]['quotation']) {
							supplier['i'+sid]['quotation'] = {};
						}
						supplier['i'+sid]['quotation']['i'+pid]=[d[3],d[1]];
					}
				}
			}
		},'next');
	}
	var up_allotbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('allotbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//repository,p[pid],[0,1,2,...,11]
				var coid = r.callout_id;
				var ciid = r.callin_id;
				if(!repository['i'+coid]) repository['i'+coid]={_id:coid};
				if(!repository['i'+ciid]) repository['i'+ciid]={_id:ciid};
				for(var i in r.detail){
					var dtl=r.detail[i],pid = dtl[0];
					if(!repository['i'+coid]['p'+pid]){
						repository['i'+coid]['p'+pid]=(k.cache.get(coid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rcoidid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+coid]['p'+pid][m1] = 0;
						repository['i'+coid]['p'+pid][m0] = 0;
					}	
					repository['i'+coid]['p'+pid][mm] -=dtl[1];
					if(!repository['i'+ciid]['p'+pid]){
						repository['i'+ciid]['p'+pid]=(k.cache.get(ciid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+ciid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+ciid]['p'+pid][m1] = 0;
						repository['i'+ciid]['p'+pid][m0] = 0;
					}	
					repository['i'+ciid]['p'+pid][mm] +=dtl[1];
				}
			}
		});
	}
	var up_checkbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('checkbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				var rid = r.repository_id;
				//repository,p[pid],[0,1,2,...,11]
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(var i in r.detail){
					var dtl=r.detail[i],pid = dtl[0];
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}
					repository['i'+rid]['p'+pid][mm] +=(dtl[2]-dtl[1]);
				}
			}
		});
	}
	var up_moneyflow=function(m,comp){
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m],apid,arid;
		var t_map={'xs':0,'os':1,'cg':2,'gz':3,'fz':4,'sf':5,'oz':6,'zz':7};
		
		k.dao.queryDynamicByMonth('moneyflow',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//3,account,amount[0,1,2,...,11]每个月底余额，0是1月底，...，从salebill,bringbill,moneyflow统计
				//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
				apid=r.account_p;arid=r.account_r;
				if(apid){
					if(!account['i'+apid]){ account['i'+apid]={_id:apid};}
					if(!account['i'+apid][sd]) {account['i'+apid][sd]=[0,0,0,0,0,0,0,0];}
					if(!r.flag) account['i'+apid][sd][t_map[r.type]] -= r.amount;
				}
				if(arid){
					if(!account['i'+arid]){ account['i'+arid]={_id:arid};}
					if(!account['i'+arid][sd]) {account['i'+arid][sd]=[0,0,0,0,0,0,0,0];}
					if(!r.flag) account['i'+arid][sd][t_map[r.type]] += r.amount;
				}
			}
		});
	}
	var compare_cs=function(tn){
		var old,now,sid,bid,sd,change,q_change,up;
		//customer,s1601~s9912对账{i1:[订单编号,总金额,定金,结款状态,删除状态(d删除,x已付全款,[空]普通签单)]...}
		//supplier,s1601~s9912对账{i1:[订单编号,总金额,定金,结款状态,删除状态]...}
		var buckt = (tn==='customer'?customer:supplier);
		for(var i=0;i<3;i++){
			sd='s'+k.cache.dates.mt[i];
			for(sid in buckt){
				old = k.cache.fixed[sid];
				now = buckt[sid];
				if(!old) continue;
				up  = {tn:tn,_id:old._id};
				up[sd] = (old[sd] || {});
				change=false;
				if(up[sd] !== 'x'){
					for(bid in now[sd]){
						if(up[sd][bid]){
							if(up[sd][bid][3]!=='x' && now[sd][bid][3] === 'd'){
								change=true;
								up[sd][bid][3]='x';
							}
						}else{
							if(now[sd][bid][3] !=='d'){
								change=true;
								up[sd][bid] = now[sd][bid];
							}
						}
					}
				}
				if(change) k.dao.updOne(up,null,3);
				if(i==0 && now['quotation']){
					old['quotation'] = old['quotation'] || {};
					q_change=false;
					for(var pid in now['quotation']){
						if(!old['quotation'][pid] ||
							old['quotation'][pid][0] != now['quotation'][pid][0] ||
							old['quotation'][pid][1] != now['quotation'][pid][1]) {
							old['quotation'][pid] = now['quotation'][pid];
							q_change = true;
						}
					}
					if(q_change) k.dao.updOne({tn:tn,_id:old._id,quotation:old.quotation},null,3);
				}
			}
		}
	}
	var compare_and_save=function(){
		compare_cs('customer');
		compare_cs('supplier');
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd0='s'+k.cache.dates.mt[0],sd1='s'+k.cache.dates.mt[1],sd2='s'+k.cache.dates.mt[2];
		var old , now , aid;
		for(aid in account){
			old = k.cache.fixed[aid];
			now = {tn:'account',amount:(old.amount || [0,0,0,0,0,0,0,0,0,0,0,0]),_id:old._id};
			now[sd2] = account[aid][sd2] || [0,0,0,0,0,0,0,0];
			now[sd1] = account[aid][sd1] || [0,0,0,0,0,0,0,0];
			now[sd0] = account[aid][sd0] || [0,0,0,0,0,0,0,0];
			now.amount[m2]=now.amount[m3]+now[sd2][0]+now[sd2][1]+now[sd2][2]+now[sd2][3]+now[sd2][4]+now[sd2][5]+now[sd2][6]+now[sd2][7];
			now.amount[m1]=now.amount[m2]+now[sd1][0]+now[sd1][1]+now[sd1][2]+now[sd1][3]+now[sd1][4]+now[sd1][5]+now[sd1][6]+now[sd1][7];
			now.amount[m0]=now.amount[m1]+now[sd0][0]+now[sd0][1]+now[sd0][2]+now[sd0][3]+now[sd0][4]+now[sd0][5]+now[sd0][6]+now[sd0][7];
			if(old.amount.toString()!==now.amount.toString()) k.dao.updOne(now,null,3);
		}
	}
	addup = function(comp){
		up_bringbill(2,function(){
			up_bringbill(1,function(){
				up_bringbill(0,function(){
		up_salebill(2,function(){
			up_salebill(1,function(){
				up_salebill(0,function(){
		up_moneyflow(2,function(){
			up_moneyflow(1,function(){
				up_moneyflow(0,function(){
					//比较&保存
					compare_and_save();
					comp();
		});});});});});});});});});
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.customer={
		release:function(){ $('#layout div.repository table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.repository button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.customer';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位客户');
				total=0;
			}});
		},
	}
	p.supplier={
		release:function(){ $('#layout div.supplier table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.supplier button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.supplier';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位供应商');
				total=0;
			}});
		},
	}
	p.clerk={
		release:function(){ $('#layout div.clerk table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.clerk button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.clerk';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位员工');
				total=0;
			}});
		},
	}
	p.account={
		init:function(){
			var total=0,box = '#layout div.account';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 个账户');
				total=0;
			}});
		},
	}
	p.product={
		release:function(){ $('#layout div.product table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.product button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.product';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 个商品');
				total=0;
			}});
		},
	}
	p.salebilling={
		init:function(){
			k.aspect.billing.init();
		}
	}
	p.salebill={
		release:function(){ $('#layout div.salebill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.salebill button.s-btn').click(); },
		init:function(){
			k.aspect.bill.init();
		}
	}
	//下面移到【 库存 】
	p.bringbilling={
		init:function(){
			k.aspect.billing.init();
		}
	}
	p.bringbill={
		release:function(){ $('#layout div.bringbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.bringbill button.s-btn').click(); },
		init:function(){
			k.aspect.bill.init();
		}
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var local = k.cache.local();
	var loadSign=function(){
//		indexedDB.deleteDatabase("kdb5");
		if(document.getElementById('sign')) return;
//		var bg=[
//        'mengjing1','mengjing2','mengjing3',
//        'huaer1','huaer2','huaer3',
//        'chuntian1','chuntian2','chuntian3',
//        'dongman1','dongman2','dongman3',
//        'katong1','katong2','katong3',
//        ],i=0;
//		window.addEventListener('click',function(){
//			$('body').css('background-image','url(../bg/'+bg[i]+'.jpg)');
//			if(++i>=bg.length) i=0;15101161756，KAANS-ZEKZA-DTYNG-MXIZY
//		});
		$('body').append(' \
			<div id="sign"> \
			<div class="sign-main"> \
				<div class="sign-logo-wrapper"> \
					<span class="icon-logo"><a href="/"> \
						<svg class="logo" version="1.1" viewBox="0 -70 1034 1034"><path d="M928 544c-28.428 0-53.958-12.366-71.536-32h-189.956l134.318 134.318c26.312-1.456 53.11 7.854 73.21 27.956 37.49 37.49 37.49 98.274 0 135.764s-98.274 37.49-135.766 0c-20.102-20.102-29.41-46.898-27.956-73.21l-134.314-134.318v189.954c19.634 17.578 32 43.108 32 71.536 0 53.020-42.98 96-96 96s-96-42.98-96-96c0-28.428 12.366-53.958 32-71.536v-189.954l-134.318 134.318c1.454 26.312-7.856 53.11-27.958 73.21-37.49 37.49-98.274 37.49-135.764 0-37.49-37.492-37.49-98.274 0-135.764 20.102-20.102 46.898-29.412 73.212-27.956l134.32-134.318h-189.956c-17.578 19.634-43.108 32-71.536 32-53.020 0-96-42.98-96-96s42.98-96 96-96c28.428 0 53.958 12.366 71.536 32h189.956l-134.318-134.318c-26.314 1.456-53.11-7.854-73.212-27.956-37.49-37.492-37.49-98.276 0-135.766 37.492-37.49 98.274-37.49 135.764 0 20.102 20.102 29.412 46.898 27.958 73.21l134.316 134.32v-189.956c-19.634-17.576-32-43.108-32-71.536 0-53.020 42.98-96 96-96s96 42.98 96 96c0 28.428-12.366 53.958-32 71.536v189.956l134.318-134.318c-1.456-26.312 7.854-53.11 27.956-73.21 37.492-37.49 98.276-37.49 135.766 0s37.49 98.274 0 135.766c-20.102 20.102-46.898 29.41-73.21 27.956l-134.32 134.316h189.956c17.576-19.634 43.108-32 71.536-32 53.020 0 96 42.98 96 96s-42.982 96-96.002 96z"></path></svg> \
					</a></span> \
				</div> \
				<div class="sign-title" style="margin-top:15px;">欢迎使用开单宝！</div> \
				<div class="sign-input-wrapper sign-input-loginname"> \
					<input type="text" class="loginname" spellcheck="false" placeholder="用户名" /> \
				</div> \
				<div class="sign-input-wrapper sign-input-password"> \
					<input type="password" class="password" spellcheck="false" placeholder="密码" /> \
				</div> \
				<div hidden class="sign-input-wrapper sign-input-inc"> \
					<input type="text" class="inc" maxlength="8" spellcheck="false" placeholder="公司简称" /> \
				</div> \
				<div hidden class="sign-input-wrapper sign-input-captcha"> \
					<input type="text" maxlength="4" class="captcha" placeholder="短信验证码" /><button class="captcha-button">发短信</button> \
				</div> \
				<div class="sign-button-wrapper sign-button-login"> \
					<button class="login">登录</button> \
				</div> \
				<div hidden class="sign-button-wrapper sign-button-register"> \
					<button class="register">注册</button> \
				</div> \
				<div hidden class="sign-button-wrapper sign-button-forget" > \
					<button class="forget">重置密码</button> \
				</div> \
				<div class="sign-a-wrapper"> \
					<div hidden class="login"><a href="#/sign/login">立即登陆</a></div> \
					<div class="register"><a href="#/sign/register">注册账号</a></div> \
					<div class="forget"><a href="#/sign/forget">忘记密码?</a></div> \
				</div> \
			</div> \
			<div hidden class="sign-loading"> \
				<p class="progress_msg">正在加载，请稍候...</p> \
			  	<progress value="0" max="100" ></progress> \
			</div> \
		</div>');
		document.onkeydown=function(e){ 
			if(e.keyCode === 13 ){//Enter
				if(e.ctrlKey){//Ctrl + Enter 开单页面
					$('#layout div.'+k.frame.current_plugin+' button.submit').click();
				}else{//Enter 登录页面
					if(window.location.hash === '#/sign/login') $('#sign .sign-button-login button').click();
				}
			}
		} 
	}
	p.forget={
		init:function(){
			loadSign();
			$('#sign button.captcha-button').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				if(!u.valid_loginname(loginname)) return;
				k.net.api('/sign/forget',{loginname : loginname},function(err,r){
					if(r){
						k.aspect.noty.message('已发短信至:'+r.obj.mobile);
						$('#sign button.captcha-button').html('已发送').attr('disabled','disabled').css('background-color','#555');
					}
				},true);
			});
			$('#sign button.forget').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				if(!u.valid_loginname(loginname)) return;
				var password = $('#sign input.password').val();
				if(!u.valid_password(password)) return;
				var pwd_local = k.safe.local_pwd(password);
				var captcha = $('#sign input.captcha').val();
				if(!captcha) return;
				k.net.api('/sign/forget',{loginname : loginname,password:k.safe.up_pwd(pwd_local,password),code:parseInt(captcha)},function(err,r){
					if(r){
						k.aspect.noty.message('密码修改成功，请登录');
						window.location.hash = '#/sign/login';
					}
				},true);
			});
		}
	}
	p.register={
		init:function(){
			loadSign();
			$('#sign input.loginname').val('');
			$('#sign .sign-button-register button').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				var password = $('#sign input.password').val();
				var inc    = $('#sign input.inc').val().trim();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				if(!u.valid_hanname(inc)) return;
				k.net.api('/sign/checkloginname',{loginname : loginname},function(err,r){
					if(err) {
						k.aspect.noty.message('网络异常！');
						return;
					}else if(r.obj && r.obj.used) {
						k.aspect.noty.message('用户名已被使用，请更换');
						return;
					}
					var pwd_local = k.safe.local_pwd(password);
					k.aspect.pay({url:'/sign/register',no_session:true,
						param:{loginname : loginname, password : k.safe.up_pwd(pwd_local,password), inc  : inc}
					},function(){
						k.aspect.noty.confirm_close();
						window.location.hash = '#/sign/login';//直接登录
						$('#sign button.login').click();
//						k.aspect.noty.message('注册成功！');
					});
				},true);
			});
		}
	}
	p.login={
		init:function(){
			loadSign();
			if(local['ln']) {
				$('#sign input.loginname').val(local['ln']);
				$('#sign input.password').focus();
			}else{
				$('#sign input.loginname').focus();
			}
			$('#sign .sign-button-login button').click(function(){
				var loginname = $('#sign input.loginname').val();
				var password = $('#sign input.password').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				
				var pwd_local = k.safe.local_pwd(password);
				k.aspect.noty.progress('登录中。。。');
				k.net.api('/sign/login',{
					loginname:loginname,
					password:k.safe.up_pwd(pwd_local,password),
					box_id  :(local['bi'+loginname] || 0)
				},function(err,r){
					if(err){
						if(err.code){
							//能联网，登录失败
							k.aspect.noty.close_progress();
							k.aspect.noty.message('登录失败！');
						}else{
							//不能联网，离线检查
							if(k.safe.local_pwd(password) === local['lp'+loginname]){
								k.cache.sign.user_id  = local['ui'+loginname];
								k.cache.sign.staff_id = local['si'+loginname];
								k.cache.sign.box_id   = local['bi'+loginname];
								location.hash = '#/sign/loading';
							}else {
								k.aspect.noty.close_progress();
								k.aspect.noty.message('用户名或密码错误！');
							}
						}
					}else {
						if(local['bi'+loginname] != r.obj.box_id) {
							k.cache.sign.need_create_db = true;
						}
						local['ln'] = loginname;
						local['ll'+loginname] = new Date().getTime();
						local['lp'+loginname] = pwd_local;
						local['ui'+loginname] = r.obj.user._id;
						local['si'+loginname] = r.obj.staff_id;
						local['bi'+loginname] = r.obj.box_id;
						//localStorage
						k.cache.local(local);
						k.cache.sign.user = r.obj.user;
						
						k.cache.sign.user_id  = r.obj.user._id;
						k.cache.sign.staff_id = r.obj.staff_id;
						k.cache.sign.box_id   = r.obj.box_id;
						
						k.cache.sign.session  = {token: r.obj.token,usb: r.obj.user._id+'-'+r.obj.staff_id+'-'+r.obj.box_id};
						location.hash = '#/sign/loading';
					}
				},true);
			});
		}
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.store={
		export_check:function(){
			var r = $('#facebox select.repository').val(),checker=$('#facebox input.checker').val();
			var i,id,v,cache_map={},box='#export',checker_id=$('#facebox input.checker').attr('data-id');
			if(checker_id){
				$(box).html('<table><th>系统编号</th><th>产品</th><th>规格</th><th>单位</th><th>系统库存</th><th>盘点后库存</th></table>');
				for(i in k.cache.fixed_by_table['product']){
					id = k.cache.fixed_by_table['product'][i];
					if(!cache_map['i'+id]){
						cache_map['i'+id] = 1;
						v = k.cache.get(id);
						$(box+' table').append('<tr><td>p'+v._id
								+'</td><td>'+(v.number+' '+(v.name || '-'))
								+'</td><td>'+(v.spec || '-')
								+'</td><td>'+(v.unit || '-')
								+'</td><td>'+v.count
								+'</td><td style="background-color:#f5f5f5;">-</td></tr>');
					}
				}
				u.file.tableToExcel($('#export').html(),k.cache.get(r).name+'-盘点表-'+checker);
			}else k.aspect.noty.message('盘点员不能为空!');
		},
		import_check:function(file){
			k.aspect.noty.progress('正在导入，请稍后...');
			u.file.excelToTable(file,function(html){
				if(html){
					$('#export').html(html);
					var p =[],i,id,count;
//					console.log($('#export table tr').length);
					for(i=0;i<$('#export table tr').length;i++){
						id = $('#export table tr:eq('+i+') td:eq(0)').html();
						count = $('#export table tr:eq('+i+') td:eq(5)').html();
						if(id && id[0] === 'p' && count && u.is_float(count.trim())){
							p.push({_id:parseInt(id.substring(1)),count:parseFloat(count.trim())});
						}
					}
					if(p.length>0){
						
					}else k.aspect.noty.message('产品库存无更新!');
//					console.dir(p);
				}
				setTimeout(function() {
					k.aspect.noty.close_progress();
				}, 1000);
			});
		},
		check:function(){
			$.facebox(' \
					<div class="fb-input-wrapper"><label>盘点员：</label><input class="checker" type="search" /></div> \
					<div class="fb-input-wrapper"><label>仓库：</label><select class="repository"></select></div> \
					<div class="fb-input-wrapper"><label>盘点步骤：</label> \
						<textarea class="remark" disabled="disabled" style="color:#078;width:390px;height:60px;">第一步：选择仓库，导出盘点表。 \
							第二步：打开盘点表，填写【盘点后库存】。 \
							第三步：导入填写后的盘点表，完成盘点。 \
						</textarea></div> \
					<div class="fb-input-wrapper"><label>注意事项：</label> \
						<textarea class="remark" disabled="disabled" style="color:#f08;width:390px;height:60px;">1：请勿修改盘点表的其他字段，勿修改文件名。 \
							2，填表期间，可以关闭本页面，可以部分盘点。 \
							3，导入盘点表前请仔细检查，导入后不支持撤销。 \
						</textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.plugin.store.export_check();">导出盘点表</button> \
					<button onclick="$(\'#importfile\').click();">导入盘点表</button> \
				</div>');
			$('#facebox div.title').html('库存盘点');
			$('#facebox input.checker').autocomplete({
				minChars: 0,
				newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.aspect.manage.create(\'clerk\');$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增职员</span></div>',
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
		        },
		        onSearchComplete:function(q,s){
		        	$(this).removeAttr('data-id');
		        },
			});
			k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
		},
		init:function(){
			var total=0,box = '#layout div.store',cache_map={};
			k.aspect.manage.init({search:function(c){
				$(box+' table.kc-manage-list tr.list').remove();
				var query = $(box+' input').val().trim(),qs,qs_len,matchs=0;
				if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
				var amount=0,v,i,id,n=0,product;
				cache_map={};
				for(i in k.cache.fixed_by_table['product']){
					id = k.cache.fixed_by_table['product'][i];
					if(!cache_map['i'+id]){
						cache_map['i'+id] = 1;
						v = k.cache.get(id);
						product = (v.name +' '+ (v.number || ''));
						if(qs){
							matchs=0;
							for(var iq in qs){
								if(product.toLowerCase().indexOf(qs[iq])>=0){
									product = product.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
									matchs++;
								}
							}
							if(matchs < qs_len) continue;
						}
						$(box+' table.kc-manage-list').append(
								 '<tr class="list '+(++n%2===0?'opp':'')+'"><td>'+n
								+'</td><td style="text-align:left;">'+product
								+'</td><td>'+(v.spec || '')
								+'</td><td>'+(v.unit || '')
								+'</td><td>'+(v.cost || '')
								+'</td><td>'+(v.amount || '')
								+'</td><td>'+(v.count || '')
								+'</td><td class="remark">'+(v.stock_remark ||'')
								+'</td></tr>');
					}
				}
				$(box+' section.summary-box').html('总：'+n+' 条，'+amount.toFixed(2)+' 元');
			},select:function(){
				$(box+' section.func-a').html('<span onclick="kaidanbao.plugin.store.check();" class="check">盘点</span>');
				$(box+' input').attr('placeholder','搜索商品名称');
				$(box+' select.s1').append('<option value="all"><所有类型></option>');
				for(var i in k.conf.table.product.type_define){
					$(box+' select.s1').append('<option value="'+i+'">'+k.conf.table.product.type_define[i]+'</option>');
				}
			},create:'noop',classify:'noop'});
		},
	}
})(window.kaidanbao);
