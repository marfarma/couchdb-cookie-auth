
-module(hash).
-export([run/0]).
-on_load(init/0).

-import(base64url, [encode/1, decode/1]).

% ERL_LIBS=/Users/pauliprice/Projects/couchdb-cookie-auth/misc/b64url erl

%% c(hash), hash:run().

run() ->
    Cookie    = <<"YWRtaW46NTYwMkNCOUU6urYrI4jgqahrY1EygJ_y-HzU098">>,
    User      = "admin",
    TimeStr   = "5602CB9E",
    Secret    = <<"92de07df7e7a3fe14808cef90a7cc0d91">>,
    UserSalt  = <<"39cb5a639e5b848228bb49fd72da18e8">>,
    Timeout   = 600,

    AuthSession = decodeBase64Url(Cookie),
    [User, TimeStr, HashStr] = re:split(AuthSession, ":", [{return, list}, {parts, 3}]),
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
        _ -> begin throw({invalid_hash, ExpectedHash, Hash}) end
    end,

    NewSessionData = User ++ ":" ++ erlang:integer_to_list(CurrentTime, 16),
    NewHash = crypto:sha_mac(FullSecret, NewSessionData),
    Cookie = encodeBase64Url(NewSessionData ++ ":" ++ binary_to_list(NewHash)).

init() -> ok.

%% verify two lists for equality without short-circuits to avoid timing attacks.
-spec verify(string(), string(), integer()) -> boolean().
verify([X|RestX], [Y|RestY], Result) ->
    verify(RestX, RestY, (X bxor Y) bor Result);
verify([], [], Result) ->
    Result == 0.

-spec verify(binary(), binary()) -> boolean();
            (list(), list()) -> boolean().
verify(<<X/binary>>, <<Y/binary>>) ->
    verify(binary_to_list(X), binary_to_list(Y));
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

