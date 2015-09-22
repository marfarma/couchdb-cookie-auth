-module(hash2).

-define(b2l(V), binary_to_list(V)).
-define(l2b(V), list_to_binary(V)).
-define(i2b(V), couch_util:integer_to_boolean(V)).
-define(b2i(V), couch_util:boolean_to_integer(V)).
-define(term_to_bin(T), term_to_binary(T, [{minor_version, 1}])).

add_path("libdir/b64url").

-export([run/0]).
-on_load(init/0).

%% c(auth), auth:run().

run() ->
    Secret    = <<"92de07df7e7a3fe14808cef90a7cc0d91">>,
    UserSalt  = <<"fb275752e32d2b6ebbba5f687a188697">>,
    Cookie    = "YWRtaW46NTYwMDg1Qzk6UhhTpdKHwyYCNjrpNt9Dp8LrOlI",
    User      = "admin",
    TimeStr   = "560085C9",
    Timeout   = 600,

    AuthSession = decodeBase64Url(Cookie),
    ["admin", "560085C9", HashStr] = re:split(AuthSession, ":", [{return, list}, {parts, 3}]),
    [_|_] = HashStr,

    TimeStamp    = erlang:list_to_integer(TimeStr, 16),
    CurrentTime  = TimeStamp, % -- normally it would be output of make_cookie_time()
    FullSecret   = <<Secret/binary, UserSalt/binary>>,
    ExpectedHash = crypto:sha_mac(FullSecret, User ++ ":" ++ TimeStr),
    Hash         = list_to_binary(HashStr),

    case TimeStamp + Timeout of
        Value when CurrentTime < Value -> ok;
        Value -> throw({invalid_value, Value, CurrentTime})
    end,
    case verify(ExpectedHash, Hash) of
        true -> ok;
        _ -> throw({invalid_hash, ExpectedHash, Hash})
    end,

    NewSessionData = User ++ ":" ++ erlang:integer_to_list(CurrentTime, 16),
    NewHash = crypto:sha_mac(FullSecret, NewSessionData),
    Cookie = encodeBase64Url(NewSessionData ++ ":" ++ binary_to_list(NewHash)).

init() ->
    ok = erlang:load_nif("./b64url/priv/b64url", 0).



%% verify two lists for equality without short-circuits to avoid timing attacks.
-spec verify(string(), string(), integer()) -> boolean().
verify([X|RestX], [Y|RestY], Result) ->
    verify(RestX, RestY, (X bxor Y) bor Result);
verify([], [], Result) ->
    Result == 0.

-spec verify(binary(), binary()) -> boolean();
            (list(), list()) -> boolean().
verify(<<X/binary>>, <<Y/binary>>) ->
    verify(?b2l(X), ?b2l(Y));
verify(X, Y) when is_list(X) and is_list(Y) ->
    case length(X) == length(Y) of
        true ->
            verify(X, Y, 0);
        false ->
            false
    end;
verify(_X, _Y) -> false.


encodeBase64Url(Url) ->
    b64url:encode(Url).

decodeBase64Url(Url64) ->
    b64url:decode(Url64).
