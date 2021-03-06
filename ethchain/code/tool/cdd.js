ust the [[Prototype]]
    setPrototypeOf(err, ServerError.prototype)

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    })

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    })

    return err
  }

  inherits(ServerError, HttpError)

  ServerError.prototype.status = code
  ServerError.prototype.statusCode = code
  ServerError.prototype.expose = false

  return ServerError
}

/**
 * Populate the exports object with constructors for every error class.
 * @private
 */

function populateConstructorExports (exports, codes, HttpError) {
  codes.forEach(function forEachCode (code) {
    var CodeError
    var name = toIdentifier(statuses[code])

    switch (codeClass(code)) {
      case 400:
        CodeError = createClientErrorConstructor(HttpError, name, code)
        break
      case 500:
        CodeError = createServerErrorConstructor(HttpError, name, code)
        break
    }

    if (CodeError) {
      // export the constructor
      exports[code] = CodeError
      exports[name] = CodeError
    }
  })

  // backwards-compatibility
  exports["I'mateapot"] = deprecate.function(exports.ImATeapot,
    '"I\'mateapot"; use "ImATeapot" instead')
}

/**
 * Convert a string of words to a JavaScript identifier.
 * @private
 */

function toIdentifier (str) {
  return str.split(' ').map(function (token) {
    return token.slice(0, 1).toUpperCase() + token.slice(1)
  }).join('').replace(/[^ _0-9a-z]/gi, '')
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  'use strict';

// Declare internals

const internals = {};


exports.escapeJavaScript = function (input) {

    if (!input) {
        return '';
    }

    let escaped = '';

    for (let i = 0; i < input.length; ++i) {

        const charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeJavaScriptChar(charCode);
        }
    }

    return escaped;
};


exports.escapeHtml = function (input) {

    if (!input) {
        return '';
    }

    let escaped = '';

    for (let i = 0; i < input.length; ++i) {

        const charCode = input.charCodeAt(i);

        if (internals.isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += internals.escapeHtmlChar(charCode);
        }
    }

    return escaped;
};


exports.escapeJson = function (input) {

    if (!input) {
        return '';
    }

    const lessThan = 0x3C;
    const greaterThan = 0x3E;
    const andSymbol = 0x26;
    const lineSeperator = 0x2028;

    // replace method
    let charCode;
    return input.replace(/[<>&\u2028\u2029]/g, (match) => {

        charCode = match.charCodeAt(0);

        if (charCode === lessThan) {
            return '\\u003c';
        }
        else if (charCode === greaterThan) {
            return '\\u003e';
        }
        else if (charCode === andSymbol) {
            return '\\u0026';
        }
        else if (charCode === lineSeperator) {
            return '\\u2028';
        }
        return '\\u2029';
    });
};


internals.escapeJavaScriptChar = function (charCode) {

    if (charCode >= 256) {
        return '\\u' + internals.padLeft('' + charCode, 4);
    }

    const hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '\\x' + internals.padLeft(hexValue, 2);
};


internals.escapeHtmlChar = function (charCode) {

    const namedEscape = internals.namedHtml[charCode];
    if (typeof namedEscape !== 'undefined') {
        return namedEscape;
    }

    if (charCode >= 256) {
        return '&#' + charCode + ';';
    }

    const hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
    return '&#x' + internals.padLeft(hexValue, 2) + ';';
};


internals.padLeft = function (str, len) {

    while (str.length < len) {
        str = '0' + str;
    }

    return str;
};


internals.isSafe = function (charCode) {

    return (typeof internals.safeCharCodes[charCode] !== 'undefined');
};


internals.namedHtml = {
    '38': '&amp;',
    '60': '&lt;',
    '62': '&gt;',
    '34': '&quot;',
    '160': '&nbsp;',
    '162': '&cent;',
    '163': '&pound;',
    '164': '&curren;',
    '169': '&copy;',
    '174': '&reg;'
};


internals.safeCharCodes = (function () {

    const safe = {};

    for (let i = 32; i < 123; ++i) {

        if ((i >= 97) ||                    // a-z
            (i >= 65 && i <= 90) ||         // A-Z
            (i >= 48 && i <= 57) ||         // 0-9
            i === 32 ||                     // space
            i === 46 ||                     // .
            i === 44 ||                     // ,
            i === 45 ||                     // -
            i === 58 ||                     // :
            i === 95) {                     // _

            safe[i] = null;
        }
    }

    return safe;
}());
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           /*
 * extsprintf.js: extended POSIX-style sprintf
 */

var mod_assert = require('assert');
var mod_util = require('util');

/*
 * Public interface
 */
exports.sprintf = jsSprintf;
exports.printf = jsPrintf;

/*
 * Stripped down version of s[n]printf(3c).  We make a best effort to throw an
 * exception when given a format string we don't understand, rather than
 * ignoring it, so that we won't break existing programs if/when we go implement
 * the rest of this.
 *
 * This implementation currently supports specifying
 *	- field alignment ('-' flag),
 * 	- zero-pad ('0' flag)
 *	- always show numeric sign ('+' flag),
 *	- field width
 *	- conversions for strings, decimal integers, and floats (numbers).
 *	- argument size specifiers.  These are all accepted but ignored, since
 *	  Javascript has no notion of the physical size of an argument.
 *
 * Everything else is currently unsupported, most notably precision, unsigned
 * numbers, non-decimal numbers, and characters.
 */
function jsSprintf(fmt)
{
	var regex = [
	    '([^%]*)',				/* normal text */
	    '%',				/* start of format */
	    '([\'\\-+ #0]*?)',			/* flags (optional) */
	    '([1-9]\\d*)?',			/* width (optional) */
	    '(\\.([1-9]\\d*))?',		/* precision (optional) */
	    '[lhjztL]*?',			/* length mods (ignored) */
	    '([diouxXfFeEgGaAcCsSp%jr])'	/* conversion */
	].join('');

	var re = new RegExp(regex);
	var args = Array.prototype.slice.call(arguments, 1);
	var flags, width, precision, conversion;
	var left, pad, sign, arg, match;
	var ret = '';
	var argn = 1;

	mod_assert.equal('string', typeof (fmt));

	while ((match = re.exec(fmt)) !== null) {
		ret += match[1];
		fmt = fmt.substring(match[0].length);

		flags = match[2] || '';
		width = match[3] || 0;
		precision = match[4] || '';
		conversion = match[6];
		left = false;
		sign = false;
		pad = ' ';

		if (conversion == '%') {
			ret += '%';
			continue;
		}

		if (args.length === 0)
			throw (new Error('too few args to sprintf'));

		arg = args.shift();
		argn++;

		if (flags.match(/[\' #]/))
			throw (new Error(
			    'unsupported flags: ' + flags));

		if (precision.length > 0)
			throw (new Error(
			    'non-zero precision not supported'));

		if (flags.match(/-/))
			left = true;

		if (flags.match(/0/))
			pad = '0';

		if (flags.match(/\+/))
			sign = true;

		switch (conversion) {
		case 's':
			if (arg === undefined || arg === null)
				throw (new Error('argument ' + argn +
				    ': attempted to print undefined or null ' +
				    'as a string'));
			ret += doPad(pad, width, left, arg.toString());
			break;

		case 'd':
			arg = Math.floor(arg);
			/*jsl:fallthru*/
		case 'f':
			sign = sign && arg > 0 ? '+' : '';
			ret += sign + doPad(pad, width, left,
			    arg.toString());
			break;

		case 'x':
			ret += doPad(pad, width, left, arg.toString(16));
			break;

		case 'j': /* non-standard */
			if (width === 0)
				width = 10;
			ret += mod_util.inspect(arg, false, width);
			break;

		case 'r': /* non-standard */
			ret += dumpException(arg);
			break;

		default:
			throw (new Error('unsupported conversion: ' +
			    conversion));
		}
	}

	ret += fmt;
	return (ret);
}

function jsPrintf() {
	process.stdout.write(jsSprintf.apply(this, arguments));
}

function doPad(chr, width, left, str)
{
	var ret = str;

	while (ret.length < width) {
		if (left)
			ret += chr;
		else
			ret = chr + ret;
	}

	return (ret);
}

/*
 * This function dumps long stack traces for exceptions having a cause() method.
 * See node-verror for an example.
 */
function dumpException(ex)
{
	var ret;

	if (!(ex instanceof Error))
		throw (new Error(jsSprintf('invalid type for %%r: %j', ex)));

	/* Note that V8 prepends "ex.stack" with ex.toString(). */
	ret = 'EXCEPTION: ' + ex.constructor.name + ': ' + ex.stack;

	if (ex.cause && typeof (ex.cause) === 'function') {
		var cex = ex.cause();
		if (cex) {
			ret += '\nCaused by: ' + dumpException(cex);
		}
	}

	return (ret);
}
                                                                                                                                                   ��#]�w�C���A�}V;���-|��k�_�9�����U~]�E&��]D�å1;1�^^�>}�I*�5ʡ�:���\�� m�����2�9�;��'=_�˃���pA#g���y�p���}?<|�R3E�!).�-'��I:{�Vo����&gc\}��c�;��^Ս]ͤ��r�R8>��= J��ޯ�1�Ы4��@�/5vd���{�ڹ��u�T�2�(a��[��GZ���R�����-�5�WW-�l���L�:�&�N����}N{�mb��S�'�Z��#����>;qM�֛4%�e�L�h���:t �rW��q3��=��6������~�5�I/�F�d��i�/a�-�Q���`��D�y�LX�7'&`�F�1�0��h����X��q>�`'��2��� �sE��:���D��k�1�-Le��+�e�]t��n����d�hg�Y�6�s�+��y��3-�D�uҗs��ژ���>�rdO��t/�Rj>Q:VD#�²�������P:�NX��N�)Z>�:�P�JU��+E��D��u��{����r���X���܏X��T�?_��d!��<ǤvB`d��~_i஗��~�3��,�s���C�YK����r�j�g��b_����	<�Y��O�8��ʭ����=#F����C>��,�.x+G�∸}�?k��,\)���NCٯ���D�û��o.�O>��=�}`�;�S޹�i�3���M�;3���c��V_���fO'���X<a����غ��tbzA��kc˳g䞫�����"��O.������~���;P#E�9v=	������"-�����!�T{l�M\O$-���Z����|�w�?��_�s��ݤ~�g��ntfzǭN���# �d�h�PS�!3��=��gś7	� �Ӑ�Ov��2I��٧*�j���-4,�O^��˵�����;�xO���F+��P�   �  ]WC  
 ��5  
��  �W  " _2lo�k�ȭi�GB��K����OLg���>r��gN�σ��{*Xt-��t+8=�$)�+�AUҨ�bO*R�U��x���i6�~�Q.�X�>���9�h��Ү!9d��8�'�����S �{!'��/���/`����?��_Ԇ�Pd���EF�����?]-w�3_s�I�p�����C,�|��Ped����S�A_�R���K/z�W��t[_��_�y�+�Ӏ9�<^�I?C�����p��8t���.;���8W{-s�i x��].��.����:^���3�|?�X�N;�����#��;������v΄o/�?�\o`�Ɇ�'����=����"~�a+�u}G�rC	X�N����TkI-ӱ�=sN��7�~:���6ӟ��(��6ߍ�Ӟ�`�.�F��HC6���rrD�`�`c2�i/}���D}���3ӌ�V��y�u�!�OK��.>�h閉.W���v���X:�7w��O��-���Hƛ����?�z�l���<Y���P�%fq�}�\�o6�������J���k�9���fz։��F�'ʼ�G6�l�5k�����lTǆ �,�_޴@�t��x�l��Ҕ����=����M�9�ǯh�9w���R� uz�(��5�[�b��z�;��R�AP��_B�;r,H��k��1����}�����e���Mȕ7�<�&�{�u�a�9�R��S/57�q]�O��+=�Nn�X;i�I,�+������3�;m6�'�'��MKg2}ސ���͘r_s7Rw�Fs�G��x��h괇��J�������L��>*��X�Rb�D���ъlI��.�y�0`��mDG�(���̲��^��vӯߐ4z���>h�&��7N&�B���,���sW'���N���:��tЦ��~���͢qc+���+�j�e���oz@�/$Q���~�#Ș��tm/�L�����
]���U1U��[rxcq�\^����^�K�����;�� ��,` ��<|��d?H��{�q�%c�f�JO,�4�z�.�j�)�t��� }0��yHCu����_�.&�
�(&u�}v�.o{�B�vN%� �fᘭ�Lq�l�:�ѣ'/F���e�ɨ�!%��:aب���2�fg��뢋6�M��l��I���pZr�x<N�ߣP1��&Trz�����,6Z����N(�Q/�A��Fo���G2� ����I1;[���&�Ww��������IC7��w�Ƿs����ٸ<��]ć����E�K��X!_Ko�����9c�?�p<z�-��9@��j۬v*5��<;g�o~�I��R�rͶ)�����a&�M�<�������P��뙆j�]GFױ���&z����0TL�,#"���x4i��p�Ѡ��$�tXXHZ��z��XuV��՗�s̍��H�g��N��J���gsh¶}��r���U��6�'��@�Hs��}*s���P���3`��|	��M���b3䉺Y�!|�a�G�G�_E�#/��N�^!����6GO\"�ߡu|~�3�@@�\��_F��,2��1�9U��:���|��zu� '��t����{�)�n��w�<9�yb�+����\���"�|Z���;����O�����kc���r��T'��?pBPNx�@�`m�I����|�T�9���t�&��-�Y�� ���r�w6�4�M=��+�#���d����spG+t��yg����R�zQ_�m!�{�1����M90�=����`�{��R�"�����:|ؿ���I��n��;�z@
�~���Uo�7��ϭTnc����5�~���+�+{E���k�r@�n�6�h�L��.0k���:�z�I{ћ����xo��0�Z/�N�De����F����8�6~A�s=L�ѹ���o��%��7J���=0�ٽ~�򅞑&y*�K6�jׅ����g��F��X&�������-n����=&�]B;mާ�)U�t�xc���s�f��%�z4��PE���w'F2(i�S�e����@��r����>*����3@Hn�Ci$f�IN��9)����$�ӻ�Hz<�xc}�B���g�_�C�$��6����Su�y+|�-�Ҿ�{,�78��3�9kƔ�<AL�@D��q:�w�L�y�3ǥ�~,���=�K�� c�{ s�R����!�"�/]==Kϸ�>���A�x�O�����>�1���7���~�������+*ɮw�h���_�cժ�g���W���I̸.��ӆ��~�y�������Y�s��]�4��tk