(function ($) {
    $.extend($.fn, {
        validate : function() {

            var args = $.validator._pre(arguments);
            validator = new $.validator(args.options);

            $.each(validator.options.messages, function(method) {
                if (typeof $.fn[method] === 'undefined') {
                    $.fn[method] = function() {
                        validator.base.apply(this, [validator, method, arguments]);
                        validator.addComponent(this, args.formSubmitted);
                        return this;
                    };
                }
            });

            this.bind("click", function(e) {
                args.formSubmitted();
                if (validator.showErrors.apply(validator)) {
                    args.callback();
                } else {
                    args.errorback();
                    return false;
                }
            });
            args.formSubmitted();
            validator.errors = {};
            return validator;

        }
    });

    $.validator = function(options) {
    	this.options    = $.extend( true, {}, $.validator.defaults,  options );
    	this.errors     = {};
    	this.components = {};
    };

    $.validator._pre = function() {
        var args = arguments[0];
        args.formSubmitted = args[0];

        if (args[1]) {
            args.options   = (args[1].options)   ? args[1].options   : null;
            args.callback  = (args[1].callback)  ? args[1].callback  : function(){};
            args.errorback = (args[1].errorback) ? args[1].errorback : function(){};
        }
        return args;
    };

    $.extend($.validator, {
    	defaults : {
            messages : {
                "required"    : "入力必須項目です。",
                "disabled"    : "使用できるのは、半角英数字、『 _ 』『 - 』『 . 』『 @ 』、半角スペースです。",
                "mailaddress" : "$1の形式が適切ではありません。",
                "forbidden"   : "$1に使用できない文字列が含まれています。",
                "notinclude"  : "パスワードに$2を含むことはできません。",
                "password_match"   : "パスワードが一致していません\nもう一度入力してください。",
                "password_level"   : "安全性の低い危険なパスワードです。パスワードの安全度を確認のうえ、もう一度入力してください。",
                "password_confirm" : "確認のために、パスワードをもう一度入力してください。"
            },
            forbidden : [
                'admin', 'test', 'administrator', 'root'
            ],
    		checkThrough : false,
            errorsBox  : "",
            bothDispError   : false
        },
    	prototype : {
            isError : function(id) {
                for (var c in this.errors[id]){
                    if (this.errors[id][c]) {
                        return true;
                    }
                }
                return false;
            },
            doValid : function(id) {
                if (typeof this.errors[id] === 'undefined') {
                    this.errors[id] = {};
                }
                return (this.isError(id)) ? this.options.checkThrough : true;
            },
            showErrors : function(component) {

                var validator = this;
                var errors = validator.errors;
                var msgs   = validator.options.messages;
                var errorsBox = validator.options.errorsBox;
                var entered     = false;
                var enteredonce = false;

                if (typeof component === 'undefined') {
                    $(".errormsg").remove();
                }

                $.each(errors, function(id) {

                    entered = false;

                    $.each(errors[id], function(e, isError) {

                        if (typeof component !== 'undefined') {
                            if ($(component).attr("id") !== id) {
                                return;
                            }
                        }

                        if (isError) {

                            if ("" === errorsBox) {
                                $("#" + id).after($("<div />").addClass("errormsg " + id).append(isError));
                            } else {
                                if ($(".validate-error ul").size() === 0) {
                                    $(errorsBox).addClass("validate-error").append("<ul />");
                                }
                                ul = $(".validate-error ul");
                                ul.append($("<li />").addClass("errormsg " + id).append(isError));

                                if (validator.options.bothDispError) {
                                    $("#" + id).after($("<div />").addClass("errormsg " + id).append(isError));
                                }
                            }

                            $("#" + id).addClass("errorborder");

                            $("#" + id).bind("focus", function() {
                                $(this).removeClass("errorborder");
                                $("." + id).remove();
                                validator._removeErrorsBox();
                            });

                            entered = true;
                            enteredonce = true;

                        }

                        else if (!entered) {
                            $("#" + id).removeClass("errorborder");
                            $("." + id).remove();
                        }
                    });
                });

                this.errors = {};
                this._removeErrorsBox();
                return !enteredonce;
            },
            base : function() {
                var id = $(this).attr("id");
                var isValid = false;
                var validator = arguments[0];
                var method = arguments[1];

                if (validator.doValid.apply(validator,[id])) {
                    isValid = validator.methods[method].apply(this, [validator, arguments[2]]);
                    if (isValid) {
                        var strf = ($(this).attr("label")) ? $(this).attr("label") : id;
                        var strt = arguments[2][0];
                            strt = ($(strt).attr("label")) ? $(strt).attr("label") : strt;
                        isValid = validator.format(validator.options.messages[method], strf, strt);
                    }
                }
                validator.errors[id][method] = isValid;
            },
            format : function(msg, id, target) {
                return msg.replace("$1", id).replace("$2", target);
            },
            addComponent : function(component, _function) {
                if (component.attr) {
                    var id = component.attr("id");

                    if (typeof this.components[id] === 'undefined') {
                        this.components[id] = true;
                        var validator = this;
                        component.bind("blur", function() {
                            _function();validator.showErrors.apply(validator, [component]);
                        });
                    }
                }
            },
            _removeErrorsBox : function() {
                if ($(".validate-error ul").size() !== 0) {
                    if ($(".validate-error li").size() === 0) {
                        $(".validate-error ul").remove();
                        $(".validate-error").removeClass("validate-error");
                    }
                }
            },
            methods : {
                required : function() {
                    if ("" === this.val()) {
                        return true;
                    }
                    return false;
                },
                password_confirm : function() {
                    if ("" === this.val()) {
                        return true;
                    }
                    return false;
                },
                disabled : function() {
                    if (this.val().match(/[^a-zA-Z0-9 _\-.@]/g)) {
                        return true;
                    }
                    return false;
                },
                mailaddress : function() {
                    if (!this.val().match(/^[0-9a-zA-Z\-\_\.+]+@[0-9a-zA-Z\-\_\.]+$/)) {
                        return true;
                    }
                    return false;
                },
                forbidden : function() {
                    var forbidden = arguments[0].options.forbidden;

                    if (typeof arguments[1][0] !== 'undefined') {
                        forbidden = $.merge( forbidden, arguments[1][0] );
                    }

                    if (forbidden.indexOf(this.val().toLowerCase()) >= 0) {
                        return true;
                    }
                    return false;
                },
                notinclude : function() {
                    if (typeof arguments[1][0] === 'undefined') {
        				console.warn( "確認対象の要素を指定してください。" );
                        return false;
                    }

                    try {
                        var regexp = new RegExp("[" + $(arguments[1][0]).val() + "]");
                        var ismatch = this.val().match(regexp);
                    } catch (e) {
                        return false;
                    }

                    if (ismatch && ismatch[0] !== "") {
                        if (ismatch[0] === $(arguments[1][0]).val()) {
                            return true;
                        }
                    }
                    return false;
                },
                password_match : function() {
                    if (typeof arguments[1][0] === 'undefined') {
        				console.warn( "比較対象の要素を指定してください。" );
                        return false;
                    }

                    if (this.val() !== $(arguments[1][0]).val()) {
                        return true;
                    }
                    return false;
                },
                password_level : function() {
                    if (typeof arguments[1][0] === 'undefined') {
                        level = 2;
                    }

                    if (level > $("#" + $(this).attr("id"))[0].level) {
                        return true;
                    }
                    return false;
                }
            }
        }
    });

})(jQuery);
