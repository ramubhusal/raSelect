(function($) {
    $.fn.raSelect = function(method) {
    if (typeof method == 'string') {
        if (method == 'update') {
            this.each(function() {
                var $select = $(this);
                var $dropdown = $(this).next('.ra-select');
                var open = $dropdown.hasClass('open');

                if ($dropdown.length) {
                    $dropdown.remove();
                    create_nice_select($select);
                    if (open) {
                        $select.next().trigger('click');
                    }
                }
            });
        } else if (method == 'destroy') {
            this.each(function() {
                var $select = $(this);
                var $dropdown = $(this).next('.ra-select');
                if ($dropdown.length) {
                    $dropdown.remove();
                    $select.css('display', '');
                }
            });
            if ($('.ra-select').length == 0) {
                $(document).off('.nice_select');
            }
        } else {
            console.log('Method "' + method + '" does not exist.')
        }
        return this;
    }
      
    // Hide native select
    this.hide();
    
    // Create custom markup
    this.each(function() {
        var $select = $(this);
        if (!$select.next().hasClass('ra-select')) {
            create_nice_select($select);
        }
    });
    
    function create_nice_select($select) {
        $select.after($('<div></div>')
            .addClass('ra-select')
            .addClass($select.attr('class') || '')
            .addClass($select.attr('disabled') ? 'disabled' : '')
            .attr('tabindex', $select.attr('disabled') ? null : '0')
            .html('<span class="current" contenteditable="true"></span><ul class="list"></ul>')
        );
        
        var $dropdown = $select.next();
        var $options = $select.find('option');
        var $selected = $select.find('option:selected');
      
        $dropdown.find('.current').html($selected.data('display') || $selected.text());
        // $dropdown.find('ul').append('<li id="search_ns_li"><input class="form-control" type="input" id="search_ns_input"/></li>');
        $options.each(function(i) {
            var $option = $(this);
            var display = $option.data('display');

            $dropdown.find('ul').append($('<li></li>')
                .attr('data-value', $option.val())
                .attr('data-display', (display || null))
                .addClass('option' +
                    ($option.is(':selected') ? ' selected' : '') +
                    ($option.is(':disabled') ? ' disabled' : ''))
                .html($option.text())
            );
        });
    }
    
    /* Event listeners */
    
    // Unbind existing events in case that the plugin has been initialized before
    $(document).off('.ra_select');

    $(document).on('focusout', '.current', function(event) {
        var $current = $(this);
        var $dropdown = $current.closest('.ra-select');

        if ($dropdown.find('.current').text() == '') {
            var val = $dropdown.find('.option.selected')[0].textContent;
            $dropdown.find('.current').text(val);
        }
    });

    $(document).on('keyup', '.current', function(event) {
        var $current = $(this);
        var $dropdown = $current.closest('.ra-select');

        var input, filter, select, tr, td, i, txtValue;
        input = $dropdown.find(".current");
        filter = input.text().toUpperCase();
        select = $dropdown[0];
        tr = select.getElementsByTagName("li");
        for (i = 0; i < tr.length; i++) {
            td = tr[i];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    // tr[i].className="option selected";
                    // tr[i].style.backgroundColor = '#f6f6f6'
                } else {
                    tr[i].style.display = "none";
                }
            }       
        }
    });

    $(document).on('focusin', '.current', function(event) {
        var $current = $(this);
        var $dropdown = $current.closest('.ra-select');

        $dropdown.find(".current").text('');
        var input, filter, select, tr, td, i, txtValue;
        input = $dropdown.find(".current");
        filter = input.text().toUpperCase();
        select = $dropdown[0];
        tr = select.getElementsByTagName("li");
        for (i = 0; i < tr.length; i++) {
            td = tr[i];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }       
        }
    });
    
    // Open/close
    $(document).on('click.ra_select', '.ra-select', function(event) {
        // $("#search_ns_input.current").text('');
        var $dropdown = $(this);

        if (event.target.className == 'current') {
            $dropdown.find('.current').text('');
            // selectText('search_ns_input');
        }
      
        $('.ra-select').not($dropdown).removeClass('open');
        $dropdown.toggleClass('open');
      
        if ($dropdown.hasClass('open')) {
            $dropdown.find('.option');  
            $dropdown.find('.focus').removeClass('focus');
            $dropdown.find('.selected').addClass('focus');
        } else {
            $dropdown.focus();
        }
    });
    
    // Close when clicking outside
    $(document).on('click.ra_select', function(event) {
        if ($(event.target).closest('.ra-select').length === 0) {
            $('.ra-select').removeClass('open').find('.option');  
        }
    });
    
    // Option click
    $(document).on('click.ra_select', '.ra-select .option:not(.disabled)', function(event) {
        var $option = $(this);
        var $dropdown = $option.closest('.ra-select');

        $dropdown.find('.selected').removeClass('selected');
        $option.addClass('selected');

        var text = $option.data('display') || $option.text();
        $dropdown.find('.current').text(text);

        var select, tr, td, i;
        select = $dropdown[0];
        tr = select.getElementsByTagName("li");
        for (i = 0; i < tr.length; i++) {
            td = tr[i];
            if (td) {
                tr[i].style.display = "";
            }       
        }

        $dropdown.prev('select').val($option.data('value')).trigger('change');
    });

    // Keyboard events
    $(document).on('keydown.ra_select', '.ra-select', function(event) {
        var $dropdown = $(this);
        var $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));

        // Space or Enter
        if (event.keyCode == 32 || event.keyCode == 13) {
            if ($dropdown.hasClass('open')) {
                $focused_option.trigger('click');
            } else {
                $dropdown.trigger('click');
            }
            return false;
            // Down
        } else if (event.keyCode == 40) {
            if (!$dropdown.hasClass('open')) {
                $dropdown.trigger('click');
            } else {
                var $next = $focused_option.nextAll('.option:not(.disabled)').first();
                if ($next.length > 0) {
                    $dropdown.find('.focus').removeClass('focus');
                    $next.addClass('focus');
                }
            }
            return false;
            // Up
        } else if (event.keyCode == 38) {
            if (!$dropdown.hasClass('open')) {
            $dropdown.trigger('click');
            } else {
            var $prev = $focused_option.prevAll('.option:not(.disabled)').first();
            if ($prev.length > 0) {
            $dropdown.find('.focus').removeClass('focus');
            $prev.addClass('focus');
            }
            }
            return false;
            // Esc
        } else if (event.keyCode == 27) {
            if ($dropdown.hasClass('open')) {
                $dropdown.trigger('click');
            }
            // Tab
        } else if (event.keyCode == 9) {
            if ($dropdown.hasClass('open')) {
                return false;
            }
        }
    });

    // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
    var style = document.createElement('a').style;
    style.cssText = 'pointer-events:auto';
    if (style.pointerEvents !== 'auto') {
        $('html').addClass('no-csspointerevents');
    }
    
    return this;
  };
}(jQuery));