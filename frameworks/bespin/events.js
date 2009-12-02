/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * ***** END LICENSE BLOCK ***** */

var bespin = require("index");
var util = require("util/util");

exports.subscribe = function() {
    /**
     * Observe a urlchange event and then... change the location hash
     */
    bespin.subscribe("url:change", function(event) {
        var hashArguments = util.queryToObject(location.hash.substring(1));
        hashArguments.project = event.project;
        hashArguments.path    = event.path;

        // window.location.hash = dojo.objectToQuery() is not doing the right thing...
        var pairs = [];
        for (var name in hashArguments) {
            var value = hashArguments[name];
            pairs.push(name + '=' + value);
        }
        window.location.hash = pairs.join("&");
    });

    /**
     * Observe a request for session status
     * This should kick in when the user uses the back button, otherwise
     * editor.openFile will check and see that the current file is the same
     * as the file from the urlbar
     */
    bespin.subscribe("url:changed", function(event) {
        bespin.get('editor').openFile(null, event.now.get('path'));
    });

    /**
     * If the command line is in focus, unset focus from the editor
     */
    bespin.subscribe("cmdline:focus", function(event) {
        bespin.get('editor').setFocus(false);
    });

    /**
     * If the command line is blurred, take control in the editor
     */
    bespin.subscribe("cmdline:blur", function(event) {
        bespin.get('editor').setFocus(true);
    });

    /**
     * Track whether a file is dirty (hasn't been saved)
     */
    bespin.subscribe("editor:document:changed", function(event) {
        bespin.publish("editor:dirty");
    });

    /**
     *
     */
    bespin.subscribe("editor:dirty", function(event) {
        bespin.get('editor').dirty = true;
    });

    /**
     *
     */
    bespin.subscribe("editor:clean", function(event) {
        bespin.get('editor').dirty = false;
    });
};
