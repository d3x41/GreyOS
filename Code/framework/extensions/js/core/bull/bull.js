/*
    BULL (AJAX System/Framework)

    File name: bull.js (Version: 18.4)
    Description: This file contains the BULL extension.
    Dependencies: Vulcan and JAP.

    Coded by George Delaportas (G0D/ViR4X) / Contributions by Catalin Maftei
    Copyright (C) 2013 - 2023
    Open Software License (OSL 3.0)
*/

// BULL
function bull()
{
    // Initialize configuration
    function init_config()
    {
        config_definition_model = { "arguments" :   [
                                                        {
                                                            "key"     :   { "name" : "type", "optional" : false },
                                                            "value"   :   {
                                                                                "type"     :   "string",
                                                                                "choices"  :   ["data", "request"]
                                                                          }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "url", "optional" : false },
                                                            "value"   :   { "type" : "string" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "data", "optional" : true },
                                                            "value"   :   { "type" : "*" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "element_id", "optional" : true },
                                                            "value"   :   { "type" : "string" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "method", "optional" : true },
                                                            "value"   :   {
                                                                                "type"     :   "string",
                                                                                "choices"  :   ["get", "post"]
                                                                          }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "ajax_mode", "optional" : true },
                                                            "value"   :   {
                                                                                "type"     :   "string",
                                                                                "choices"  :   ["asynchronous", "synchronous"]
                                                                          }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "content_fill_mode", "optional" : true },
                                                            "value"   :   {
                                                                                "type"     :   "string",
                                                                                "choices"  :   ["replace", "append"]
                                                                          }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "response_timeout", "optional" : true },
                                                            "value"   :   { "type" : "number" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "on_success", "optional" : true },
                                                            "value"   :   { "type" : "function" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "on_fail", "optional" : true },
                                                            "value"   :   { "type" : "function" }
                                                        },
                                                        {
                                                            "key"     :   { "name" : "on_timeout", "optional" : true },
                                                            "value"   :   { "type" : "function" }
                                                        }
                                                    ]
                                  };
    }
    
    // AJAX core infrastructure
    function ajax_core()
    {
        function ajax_model()
        {
            this.http_session = function(url, data, method, mode)
            {
                __xml_http.open(method.toUpperCase(), url, mode);
                
                if (method === 'post' && !utils.validation.misc.is_object(data))
                    __xml_http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                
                __xml_http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                if (mode === true)
                    __xml_http.onreadystatechange = state_changed;
                
                __xml_http.send(data);
                
                if (mode === false)
                    state_changed();
            };
            
            this.create_object = function()
            {
                var __xml_http_obj = null;
                
                if (window.XMLHttpRequest)
                    __xml_http_obj = new XMLHttpRequest();
                else
                    __xml_http_obj = new ActiveXObject("Microsoft.XMLHTTP");
                
                return __xml_http_obj;
            };
        }
        
        function state_changed()
        {
            if (__xml_http.readyState === 4)
            {
                if (__is_timeout === true)
                {
                    if (utils.validation.misc.is_function(__timeout_callback))
                        __timeout_callback.call(this);
                    else
                    {
                        if (utils.validation.misc.is_function(__fail_callback))
                            __fail_callback.call(this);
                    }
                    
                    return false;
                }
                
                stop_timer(__timer_handler);
                
                __ajax_response = null;
                __is_timeout = false;
                
                if (__xml_http.status === 200)
                {
                    if (__data_div_id === null)
                        __ajax_response = __xml_http.responseText;
                    else
                    {
                        var __container = utils.objects.by_id(__data_div_id);
                        
                        if (utils.validation.misc.is_invalid(__container))
                            return false;
                        
                        __ajax_response = __xml_http.responseText;
                        
                        if (__content_fill_mode === 'replace')
                            __container.innerHTML = __ajax_response;
                        else
                            __container.innerHTML += __ajax_response;
                    }
                    
                    if (utils.validation.misc.is_function(__success_callback))
                        __success_callback.call(this, result());
                }
                else
                {
                    if (utils.validation.misc.is_function(__fail_callback))
                        __fail_callback.call(this);
                    
                    return false;
                }
            }
            
            return true;
        }
        
        function result()
        {
            if (utils.validation.misc.is_undefined(__ajax_response))
                return null;
            
            return __ajax_response;
        }
        
        function init_ajax()
        {
            __xml_http = ajax.create_object();
        }
        
        function set_callbacks(success_callback, fail_callback, timeout_callback)
        {
            __success_callback = success_callback;
            __fail_callback = fail_callback;
            __timeout_callback = timeout_callback;
        }
        
        function run_timer(response_timeout)
        {
            if (utils.validation.numerics.is_integer(response_timeout))
                __timer_handler = setTimeout(function() { __is_timeout = true; }, response_timeout);
        }
        
        function stop_timer(timer_handler)
        {
            if (!utils.validation.misc.is_invalid(timer_handler))
                clearTimeout(timer_handler);
        }
        
        this.data = function(url, data, element_id, content_fill_mode, success_callback, fail_callback, response_timeout, timeout_callback)
        {
            __data_div_id = element_id;
            __content_fill_mode = content_fill_mode;
            
            set_callbacks(success_callback, fail_callback, timeout_callback);
            
            run_timer(response_timeout);
            
            ajax.http_session(url, data, 'post', true);
            
            return null;
        };
        
        this.request = function(url, data, method, ajax_mode, success_callback, fail_callback, response_timeout, timeout_callback)
        {
            set_callbacks(success_callback, fail_callback, timeout_callback);
            
            run_timer(response_timeout);
            
            if (ajax_mode === 'asynchronous')
                ajax.http_session(url, data, method, true);
            else
            {
                ajax.http_session(url, data, method, false);
                
                if (!utils.validation.misc.is_invalid(__ajax_response))
                    return __ajax_response;
            }
            
            return null;
        };
        
        var __xml_http = null,
            __data_div_id = null,
            __content_fill_mode = null,
            __success_callback = null,
            __timeout_callback = null,
            __fail_callback = null,
            __timer_handler = null,
            __ajax_response = null,
            __is_timeout = false,
            ajax = new ajax_model();
        
        init_ajax();
    }
    
    // Run AJAX
    this.run = function(user_config)
    {
        if (!config_parser.verify(config_definition_model, user_config))
            return false;
        
        if (utils.validation.misc.is_nothing(user_config.url) || 
            !utils.validation.misc.is_invalid(user_config.response_timeout) && 
            (!utils.validation.numerics.is_integer(user_config.response_timeout) || 
             user_config.response_timeout < 1 || user_config.response_timeout > 60000))
            return false;
        
        if (utils.validation.misc.is_invalid(user_config.data))
            user_config.data = null;
        
        if (user_config.type === 'data')        // [AJAX Data] => Modes: Asynchronous / Method: POST
        {
            if (utils.validation.misc.is_invalid(user_config.data) || 
                !utils.validation.misc.is_invalid(user_config.method) || !utils.validation.misc.is_invalid(user_config.ajax_mode) || 
                !utils.objects.by_id(user_config.element_id) || utils.validation.misc.is_invalid(user_config.content_fill_mode))
                return false;
            
            return new ajax_core().data(user_config.url, user_config.data, user_config.element_id, user_config.content_fill_mode, 
                                        user_config.on_success, user_config.on_fail, 
                                        user_config.response_timeout, user_config.on_timeout);
        }
        else                                    // [AJAX Request] => Modes: Asynchronous, Synchronous / Methods: GET, POST
        {
            if (utils.validation.misc.is_invalid(user_config.ajax_mode))
                return false;
            
            if (utils.validation.misc.is_invalid(user_config.method))
                user_config.method = 'get';
            else
                user_config.method = user_config.method.toLowerCase();
            
            return new ajax_core().request(user_config.url, user_config.data, user_config.method, user_config.ajax_mode, 
                                           user_config.on_success, user_config.on_fail, 
                                           user_config.response_timeout, user_config.on_timeout);
        }
    };
    
    var config_definition_model = null,
        utils = new vulcan(),
        config_parser = new jap();
    
    init_config();
}
