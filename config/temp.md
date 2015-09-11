        Req#httpd{user_ctx=#user_ctx{
            name=?l2b(User),
            roles=couch_util:get_value(<<"roles">>, UserProps, [])
        }, auth={FullSecret, TimeLeft < Timeout*0.9}};
        
        
    // YWRtaW46NTVGNDQyNTk63U-Io3j9xqPnsRpiEGgdT834Wk0
    // admin:55F44259:ÝB(Þ?q¨ùìFSó~

        
        
        
        % Note: we only set the AuthSession cookie if:
        %  * a valid AuthSession cookie has been received
        %  * we are outside a 10% timeout window
        %  * and if an AuthSession cookie hasn't already been set e.g. by a login
        %    or logout handler.
        % The login and logout handlers need to set the AuthSession cookie
        % themselves.

        CookieHeader = couch_util:get_value("Set-Cookie", Headers, ""),
        Cookies = mochiweb_cookies:parse_cookie(CookieHeader),
        AuthSession = couch_util:get_value("AuthSession", Cookies),
        if AuthSession == undefined ->
            TimeStamp = make_cookie_time(),
            [cookie_auth_cookie(Req, ?b2l(User), Secret, TimeStamp)];
        true ->
            []
        end;