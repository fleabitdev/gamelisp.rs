let searchIndex = [
	["Special Forms", false, "special-forms"],
	["quote", true, "quote"],
	["do", true, "do"],
	["block", true, "block"],
	["restart-block", true, "restart-block"],
	["finish-block", true, "finish-block"],
	["if", true, "if"],
	["let", true, "let"],
	["fn", true, "fn"],
	["return", true, "return"],
	["yield", true, "yield"],
	["macro-no-op", true, "macro-no-op"],
	["defer", true, "defer"],
	["defer-yield", true, "defer-yield"],
	["splice", true, "splice"],
	["let-macro", true, "let-macro"],
	["met-name", true, "met-name"],
	["splay", true, "splay"],
	["=", true, "set"],
	["Abbreviations", false, "abbreviations"],
	["\'", true, "quote-abbrv"],
	["quote-abbrv", true, "quote-abbrv"],
	["`", true, "backquote-abbrv"],
	["backquote-abbrv", true, "backquote-abbrv"],
	["~", true, "unquote-abbrv"],
	["unquote-abbrv", true, "unquote-abbrv"],
	["..", true, "splay-abbrv"],
	["splay-abbrv", true, "splay-abbrv"],
	["@", true, "atsign-abbrv"],
	["atsign-abbrv", true, "atsign-abbrv"],
	[".", true, "met-name-abbrv"],
	["met-name-abbrv", true, "met-name-abbrv"],
	["[]", true, "access-abbrv"],
	["access-abbrv", true, "access-abbrv"],
	["\"{}\"", true, "template-str-abbrv"],
	["template-str-abbrv", true, "template-str-abbrv"],
	["Macros", false, "macros"],
	["when", true, "when"],
	["unless", true, "unless"],
	["and", true, "and"],
	["or", true, "or"],
	["cond", true, "cond"],
	["cond-eq?", true, "cond-eq-p"],
	["cond-same?", true, "cond-same-p"],
	["cond==", true, "cond-num-eq"],
	["loop", true, "loop"],
	["break", true, "break"],
	["continue", true, "continue"],
	["while", true, "while"],
	["until", true, "until"],
	["for", true, "for"],
	["forn", true, "forn"],
	["forni", true, "forni"],
	["yield-from", true, "yield-from"],
	["bind-place!", true, "bind-place-mut"],
	["defplace", true, "defplace"],
	["inc!", true, "inc-mut"],
	["dec!", true, "dec-mut"],
	["mul!", true, "mul-mut"],
	["div!", true, "div-mut"],
	["div-euclid!", true, "div-euclid-mut"],
	["rem!", true, "rem-mut"],
	["rem-euclid!", true, "rem-euclid-mut"],
	["abs!", true, "abs-mut"],
	["neg!", true, "neg-mut"],
	["seek!", true, "seek-mut"],
	["antiseek!", true, "antiseek-mut"],
	["clamp!", true, "clamp-mut"],
	["swap!", true, "swap-mut"],
	["match", true, "match"],
	["matches?", true, "matches-p"],
	["when-let", true, "when-let"],
	["do-0", true, "do-0"],
	["include", true, "include"],
	["->", true, "arrow-first"],
	["->>", true, "arrow-last"],
	["backquote", true, "backquote"],
	["unquote", true, "unquote"],
	["Types", false, "types"],
	["type-of", true, "type-of"],
	["nil?", true, "nil-p"],
	["bool?", true, "bool-p"],
	["int?", true, "int-p"],
	["flo?", true, "flo-p"],
	["sym?", true, "sym-p"],
	["char?", true, "char-p"],
	["arr?", true, "arr-p"],
	["str?", true, "str-p"],
	["tab?", true, "tab-p"],
	["iter?", true, "iter-p"],
	["obj?", true, "obj-p"],
	["class?", true, "class-p"],
	["fn?", true, "fn-p"],
	["coro?", true, "coro-p"],
	["rfn?", true, "rfn-p"],
	["rdata?", true, "rdata-p"],
	["int", true, "int"],
	["flo", true, "flo"],
	["char", true, "char"],
	["bool", true, "bool"],
	["not", true, "not"],
	["num?", true, "num-p"],
	["deque?", true, "deque-p"],
	["callable?", true, "callable-p"],
	["expander?", true, "expander-p"],
	["iterable?", true, "iterable-p"],
	["Evaluation", false, "evaluation"],
	["global", true, "global"],
	["global=", true, "set-global"],
	["freeze-global!", true, "freeze-global-mut"],
	["has-global?", true, "has-global-p"],
	["bind-global!", true, "bind-global-mut"],
	["del-global!", true, "del-global-mut"],
	["def", true, "def"],
	["with-global", true, "with-global"],
	["defn", true, "defn"],
	["let-fn", true, "let-fn"],
	["fn-name", true, "fn-name"],
	["arg-limits", true, "arg-limits"],
	["min-args", true, "min-args"],
	["max-args", true, "max-args"],
	["fn0", true, "fn0"],
	["fn1", true, "fn1"],
	["no-op", true, "no-op"],
	["identity", true, "identity"],
	["fn-yields?", true, "fn-yields-p"],
	["coro-state", true, "coro-state"],
	["coro-run", true, "coro-run"],
	["coro-finish!", true, "coro-finish-mut"],
	["load", true, "load"],
	["require", true, "require"],
	["eval", true, "eval"],
	["eval-multi", true, "eval-multi"],
	["load-str", true, "load-str"],
	["expand", true, "expand"],
	["expand-multi", true, "expand-multi"],
	["expand-1", true, "expand-1"],
	["macro", true, "macro"],
	["macro=", true, "set-macro"],
	["has-macro?", true, "has-macro-p"],
	["bind-macro!", true, "bind-macro-mut"],
	["del-macro!", true, "del-macro-mut"],
	["defmacro", true, "defmacro"],
	["Numbers", false, "numbers"],
	["+", true, "add"],
	["-", true, "sub"],
	["*", true, "mul"],
	["/", true, "div"],
	["%", true, "rem"],
	["div-euclid", true, "div-euclid"],
	["rem-euclid", true, "rem-euclid"],
	["abs", true, "abs"],
	["sign", true, "sign"],
	["even?", true, "even-p"],
	["odd?", true, "odd-p"],
	["nat-int?", true, "nat-int-p"],
	["pos-int?", true, "pos-int-p"],
	["neg-int?", true, "neg-int-p"],
	["nan?", true, "nan-p"],
	["inf?", true, "inf-p"],
	["==", true, "num-eq"],
	["<", true, "lt"],
	["<=", true, "lte"],
	[">", true, "gt"],
	[">=", true, "gte"],
	["ord", true, "ord"],
	["min", true, "min"],
	["max", true, "max"],
	["clamp", true, "clamp"],
	["round", true, "round"],
	["floor", true, "floor"],
	["ceil", true, "ceil"],
	["sqrt", true, "sqrt"],
	["cbrt", true, "cbrt"],
	["pow", true, "pow"],
	["log", true, "log"],
	["flo-sign", true, "flo-sign"],
	["trunc", true, "trunc"],
	["fract", true, "fract"],
	["sin", true, "sin"],
	["cos", true, "cos"],
	["tan", true, "tan"],
	["asin", true, "asin"],
	["acos", true, "acos"],
	["atan", true, "atan"],
	["bitand", true, "bitand"],
	["bitor", true, "bitor"],
	["bitxor", true, "bitxor"],
	["bitnot", true, "bitnot"],
	["bitshl", true, "bitshl"],
	["bitshr", true, "bitshr"],
	["bitsar", true, "bitsar"],
	["rand", true, "rand"],
	["chance?", true, "chance-p"],
	["rand-pick", true, "rand-pick"],
	["rand-weighted", true, "rand-weighted"],
	["rand-reseed", true, "rand-reseed"],
	["smoothstep", true, "smoothstep"],
	["seek", true, "seek"],
	["antiseek", true, "antiseek"],
	["Collections", false, "collections"],
	["len", true, "len"],
	["empty?", true, "empty-p"],
	["access", true, "access"],
	["access=", true, "set-access"],
	["has?", true, "has-p"],
	["remove!", true, "remove-mut"],
	["del!", true, "del-mut"],
	["clear!", true, "clear-mut"],
	["map-syntax", true, "map-syntax"],
	["arr", true, "arr"],
	["arr-from-elem", true, "arr-from-elem"],
	["push!", true, "push-mut"],
	["push-start!", true, "push-start-mut"],
	["pop!", true, "pop-mut"],
	["pop-start!", true, "pop-start-mut"],
	["insert!", true, "insert-mut"],
	["grow!", true, "grow-mut"],
	["shrink!", true, "shrink-mut"],
	["swap-remove!", true, "swap-remove-mut"],
	["swap-remove-start!", true, "swap-remove-start-mut"],
	["sort", true, "sort"],
	["sort!", true, "sort-mut"],
	["starts-with?", true, "starts-with-p"],
	["ends-with?", true, "ends-with-p"],
	["position", true, "position"],
	["rposition", true, "rposition"],
	["rev!", true, "rev-mut"],
	["map!", true, "map-mut"],
	["retain!", true, "retain-mut"],
	["join", true, "join"],
	["tab", true, "tab"],
	["extend!", true, "extend-mut"],
	["keys-eqv?", true, "keys-eqv-p"],
	["Strings and Text", false, "strings-and-text"],
	["str", true, "str"],
	["template-str", true, "template-str"],
	["pretty-str", true, "pretty-str"],
	["int->str", true, "int-to-str"],
	["flo->str", true, "flo-to-str"],
	["sym", true, "sym"],
	["gensym", true, "gensym"],
	["valid-sym-char?", true, "valid-sym-char-p"],
	["valid-sym-str?", true, "valid-sym-str-p"],
	["representable-sym-str?", true, "representable-sym-str-p"],
	["parse", true, "parse"],
	["parse-all", true, "parse-all"],
	["parse-1", true, "parse-1"],
	["unparse", true, "unparse"],
	["pretty-unparse", true, "pretty-unparse"],
	["pr", true, "pr"],
	["prn", true, "prn-fn"],
	["pretty-prn", true, "pretty-prn"],
	["epr", true, "epr"],
	["eprn", true, "eprn"],
	["pretty-eprn", true, "pretty-eprn"],
	["uppercase", true, "uppercase"],
	["lowercase", true, "lowercase"],
	["replace", true, "replace"],
	["trim", true, "trim"],
	["trim-start", true, "trim-start"],
	["trim-end", true, "trim-end"],
	["pad", true, "pad"],
	["pad-start", true, "pad-start"],
	["pad-end", true, "pad-end"],
	["whitespace?", true, "whitespace-p"],
	["contains?", true, "contains-p"],
	["Iterators", false, "iterators"],
	["iter", true, "iter"],
	["iter-next!", true, "iter-next-mut"],
	["iter-next-back!", true, "iter-next-back-mut"],
	["iter-finished?", true, "iter-finished-p"],
	["iter-double-ended?", true, "iter-double-ended-p"],
	["rn", true, "rn"],
	["rni", true, "rni"],
	["once", true, "once"],
	["once-with", true, "once-with"],
	["repeat", true, "repeat"],
	["repeat-with", true, "repeat-with"],
	["chunks", true, "chunks"],
	["chunks-exact", true, "chunks-exact"],
	["rchunks", true, "rchunks"],
	["rchunks-exact", true, "rchunks-exact"],
	["windows", true, "windows"],
	["lines", true, "lines"],
	["split", true, "split"],
	["keys", true, "keys"],
	["values", true, "values"],
	["rev", true, "rev"],
	["enumerate", true, "enumerate"],
	["cloned", true, "cloned"],
	["deep-cloned", true, "deep-cloned"],
	["step-by", true, "step-by"],
	["map", true, "map"],
	["filter", true, "filter"],
	["zip", true, "zip"],
	["chain", true, "chain"],
	["flatten", true, "flatten"],
	["cycle", true, "cycle"],
	["take", true, "take"],
	["take-while", true, "take-while"],
	["skip", true, "skip"],
	["skip-while", true, "skip-while"],
	["count", true, "count"],
	["nth", true, "nth"],
	["nth-back", true, "nth-back"],
	["any?", true, "any-p"],
	["all?", true, "all-p"],
	["find", true, "find"],
	["rfind", true, "rfind"],
	["fold", true, "fold"],
	["rfold", true, "rfold"],
	["Objects and Classes", false, "objects-and-classes"],
	["class", true, "class"],
	["defclass", true, "defclass"],
	["let-class", true, "let-class"],
	["mixin", true, "mixin"],
	["defmixin", true, "defmixin"],
	["let-mixin", true, "let-mixin"],
	["bind-classmacro!", true, "bind-classmacro-mut"],
	["defclassmacro", true, "defclassmacro"],
	["defstruct", true, "defstruct"],
	["name", true, "name-clause"],
	["mixin", true, "mixin-clause"],
	["field", true, "field-clause"],
	["const", true, "const-clause"],
	["met", true, "met-clause"],
	["prop", true, "prop-clause"],
	["init", true, "init-clause"],
	["init-mixin", true, "init-mixin-clause"],
	["fini", true, "fini-clause"],
	["fini-mixin", true, "fini-mixin-clause"],
	["wrap", true, "wrap-clause"],
	["wrap-prop", true, "wrap-prop-clause"],
	["state", true, "state-clause"],
	["state*", true, "statex-clause"],
	["fsm", true, "fsm-clause"],
	["init-state", true, "init-state-clause"],
	["fini-state", true, "fini-state-clause"],
	["atsign", true, "atsign"],
	["atsign", true, "atsign"],
	["@self", true, "atsign-self"],
	["atsign-self", true, "atsign-self"],
	["@class", true, "atsign-class"],
	["atsign-class", true, "atsign-class"],
	["@class-name", true, "atsign-class-name"],
	["atsign-class-name", true, "atsign-class-name"],
	["@state-name", true, "atsign-state-name"],
	["atsign-state-name", true, "atsign-state-name"],
	["@field", true, "atsign-field"],
	["atsign-field", true, "atsign-field"],
	["@base", true, "atsign-base"],
	["atsign-base", true, "atsign-base"],
	["@enab!", true, "atsign-enab-mut"],
	["atsign-enab-mut", true, "atsign-enab-mut"],
	["@enab?", true, "atsign-enab-p"],
	["atsign-enab-p", true, "atsign-enab-p"],
	["@disab!", true, "atsign-disab-mut"],
	["atsign-disab-mut", true, "atsign-disab-mut"],
	["call-met", true, "call-met"],
	["has-met?", true, "has-met-p"],
	["is?", true, "is-p"],
	["class-of", true, "class-of"],
	["class-name", true, "class-name"],
	["class-has-mixin?", true, "class-has-mixin-p"],
	["class-mixins", true, "class-mixins"],
	["mixin?", true, "mixin-p"],
	["enab!", true, "enab-mut"],
	["enab?", true, "enab-p"],
	["disab!", true, "disab-mut"],
	["has-state?", true, "has-state-p"],
	["obj-kill!", true, "obj-kill-mut"],
	["obj-killed?", true, "obj-killed-p"],
	["Miscellaneous", false, "miscellaneous"],
	["bail", true, "bail"],
	["ensure", true, "ensure"],
	["todo", true, "todo"],
	["dbg", true, "dbg"],
	["try", true, "try"],
	["try-verbose", true, "try-verbose"],
	["file-location", true, "file-location"],
	["stack-trace", true, "stack-trace"],
	["eq?", true, "eq-p"],
	["same?", true, "same-p"],
	["==any?", true, "num-eq-any-p"],
	["eq-any?", true, "eq-any-p"],
	["same-any?", true, "same-any-p"],
	["clone", true, "clone"],
	["deep-clone", true, "deep-clone"],
	["freeze!", true, "freeze-mut"],
	["deep-freeze!", true, "deep-freeze-mut"],
	["freed?", true, "freed-p"],
	["time", true, "time"],
	["sleep", true, "sleep"],
	["unix-time", true, "unix-time"],
	["gc", true, "gc"],
	["gc-value", true, "gc-value"],
	["gc-value=", true, "set-gc-value"],
];

//the static site generator prefixes this file with a literal array bound to the local variable
//searchIndex. each field is a 3-tuple: [name, is_code, href]

let apiSearchField;

//we cache the starting layout for the "APIs by Category" sidebar so that it can be restored if
//the search-field is cleared
let originalHeaderText;
let originalApiLinkList;

//search("text") replaces the "APIs by Category" sidebar with a list of `searchIndex` which
//case-insensitively match the query string, starting with exact matches, then prefix matches, 
//then all other matches. the original relative ordering is preserved. search("") restores the 
//original "APIs by Category" sidebar.
function search(rawSearchText) {
	let searchText = rawSearchText.toLowerCase();

	let apiList = document.getElementById("api-list");
	let apiListHeader = document.getElementById("api-list-header");

	if (searchText.length == 0) {
		if (apiList.lastElementChild != originalApiLinkList) {
			if (apiList.lastElementChild.id == "api-link-list") {
				apiList.removeChild(apiList.lastElementChild);
			}

			apiList.appendChild(originalApiLinkList);
			apiListHeader.innerText = originalHeaderText;
		}	
	} else {
		if (apiList.lastElementChild == originalApiLinkList) {
			apiListHeader.innerText = "Search Results";

			apiList.removeChild(apiList.lastElementChild);

			let linkList = document.createElement("div");
			linkList.id = "api-link-list";
			linkList.className = "link-list";

			apiList.appendChild(linkList);
		}

		let linkList = apiList.lastElementChild;

		while (linkList.lastElementChild) {
			linkList.removeChild(linkList.lastElementChild);
		}

		let prefixResults = []
		let otherResults = [];
		for (searchItem of searchIndex) {
			let candidate = searchItem[0].toLowerCase();

			if (candidate == searchText) {
				prefixResults.unshift(searchItem);
			} else {
				let findIndex = candidate.indexOf(searchText);
				if (findIndex == 0) {
					prefixResults.push(searchItem);
				} else if (findIndex != -1) {
					otherResults.push(searchItem);
				}
			}
		}
		let results = prefixResults.concat(otherResults);

		if (results.length == 0) {
			let emptyItem = document.createElement("div");
			emptyItem.className = "list-level0 empty-message";
			emptyItem.appendChild(document.createTextNode("No results found"));
			linkList.appendChild(emptyItem);
		} else {
			for (result of results) {
				let userFacingName = result[0];
				let isCode = result[1];
				let href = result[2];

				let a = document.createElement("a");
				console.assert(encodeURIComponent(href) == href);
				a.href = href;
				linkList.appendChild(a);

				let listItem = document.createElement("div");
				listItem.className = "list-level0";
				a.appendChild(listItem);

				let span;
				if (isCode) {
					span = document.createElement("code");
				} else {
					span = document.createElement("span");
				}
				span.appendChild(document.createTextNode(userFacingName));
				listItem.appendChild(span);
			}
		}
	}
}

//invoked when return is pressed with the search-field focused. if there is at least one item
//in the search results list, emulates a click on the topmost item (to navigate to that page).
function navigateToFirstResult() {
	let apiList = document.getElementById("api-list");

	let apiLinkList = apiList.lastElementChild;
	if (apiLinkList != originalApiLinkList) {
		let target = apiLinkList.firstElementChild;
		if (target.tagName == "A") {
			target.click();
		}
	}
}

function initSearch() {
	//look up elements
	apiSearchField = document.getElementById("api-search-field");
	originalHeaderText = document.getElementById("api-list-header").innerText;
	originalApiLinkList = document.getElementById("api-link-list");

	//by default, the search-field is hidden so that it doesn't show up when js is disabled
	apiSearchField.parentElement.style.display = "block";

	//if the search-field text is changed or submitted, invoke search()
	apiSearchField.addEventListener("input", (ev) => {
		search(ev.target.value);
	});

	apiSearchField.addEventListener("change", (ev) => {
		ev.target.blur();
		search(ev.target.value);
	});

	//if the return key is pressed, unfocus the search field and perhaps invoke navigateToFirstResult.
	//if the esc key is pressed, clear and unfocus the search field.
	apiSearchField.addEventListener("keydown", (ev) => {
		if (ev.key == "Enter") {
			ev.target.blur();
			if (ev.target.value.length > 0) {
				navigateToFirstResult();
			}
		}

		if (ev.key == "Escape") {
			ev.target.blur();
			ev.target.value = "";
			search("");
		}
	});

	//when the hamburger menu is opened or closed, clear the search field.
	document.getElementById("checkbox-hack").addEventListener("input", (ev) => {
		let apiSearchField = document.getElementById("api-search-field");
		apiSearchField.blur();
		apiSearchField.value = "";
		search("");
	});

	//when the search-field is not focused and the S or / key is pressed, focus it.
	document.body.addEventListener("keydown", (ev) => {
		let apiSearchField = document.getElementById("api-search-field");
		if (!(document.activeElement == apiSearchField && document.hasFocus())) {
			if (ev.key == "/" || ev.key == "s" || ev.key == "S") {
				apiSearchField.focus();
				ev.preventDefault();
			}
		}
	});
}

initSearch();
