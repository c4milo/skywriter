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
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
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

var SC = require('sproutcore/runtime').SC;

exports.Project = SC.Object.extend({
    directory: null,
    name: null
});

/*
 * Given a full path in the bespin file system, figure out which
 * project it belongs to and return a two element array with
 * the Project object and the remaining path within that project.
 */
exports.getProjectAndPath = function(path) {
    // The implementation is simple at this point. The project
    // is just the directory at the top level.
    var slash = path.indexOf("/");
    if (slash == -1) {
        return [null, path];
    }
    if (slash == 0) {
        path = path.substring(1);
        slash = path.indexOf("/");
    }
    
    var projectName = path.substring(0, slash);
    
    // todo: also need to include the directory when setting up the
    // project
    var project = exports.Project.create({
        name: projectName
    });
    return [project, path.substring(slash+1)];
};
