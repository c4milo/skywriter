require.def(['require', 'exports', 'module',
    'skywriter/promise',
    'standard_syntax'
], function(require, exports, module,
    promise,
    standard_syntax
) {

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Skywriter Team (skywriter@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"define metadata";
({
    "description": "CSS syntax highlighter",
    "dependencies": {
        "standard_syntax": "0.0.0"
    },
    "environments": {
        "worker": true
    },
    "provides": [
        {
            "ep": "syntax",
            "name": "css",
            "pointer": "#CSSSyntax",
            "fileexts": [ "css", "less" ]
        }
    ]
});
"end";

var Promise = promise.Promise; //SYNC_REQ: var Promise = require('skywriter:promise').Promise;
var StandardSyntax = standard_syntax.StandardSyntax; //SYNC_REQ: var StandardSyntax = require('standard_syntax').StandardSyntax;

var COMMENT_REGEXP = {
    regex:  /^\/\/.*/,
    tag:    'comment'
};

var createCommentState = function(jumpBackState) {
    return [
        {
            regex:  /^[^*\/]+/,
            tag:    'comment'
        },
        {
            regex:  /^\*\//,
            tag:    'comment',
            then:   jumpBackState
        },
        {
            regex:  /^[*\/]/,
            tag:    'comment'
        }
    ];
};

var states = {
    start: [
        {
            //style names
            regex:  /^([a-zA-Z-\s]*)(?:\:)/,
            tag:    'identifier',
            then:   'style'
        },
        {
            //tags
            regex:  /^([\w]+)(?![a-zA-Z0-9_:])([,|{]*?)(?!;)(?!(;|%))/,
            tag:    'keyword',
            then:   'header'
        },
        {
            //id
            regex:  /^#([a-zA-Z]*)(?=.*{*?)/,
            tag:    'keyword',
            then:   'header'
        },
        {
            //classes
            regex:  /^\.([a-zA-Z]*)(?=.*{*?)/,
            tag:    'keyword',
            then:   'header'
        },
            COMMENT_REGEXP,
        {
            regex:  /^\/\*/,
            tag:    'comment',
            then:   'comment'
        },
        {
            regex:  /^./,
            tag:    'plain'
        }
    ],

    header: [
        {
            regex:  /^[^{|\/\/|\/\*]*/,
            tag:    'keyword',
            then:   'start'
        },
            COMMENT_REGEXP,
        {
            regex:  /^\/\*/,
            tag:    'comment',
            then:   'comment_header'
        }
    ],

    style: [
        {
            regex:  /^[^;|}|\/\/|\/\*]+/,
            tag:    'plain'
        },
        {
            regex:  /^;|}/,
            tag:    'plain',
            then:   'start'
        },
            COMMENT_REGEXP,
        {
            regex:  /^\/\*/,
            tag:    'comment',
            then:   'comment_style'
        }
    ],

    comment:        createCommentState('start'),
    comment_header: createCommentState('header'),
    comment_style:  createCommentState('style')
};

exports.CSSSyntax = new StandardSyntax(states);

});
