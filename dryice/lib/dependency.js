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
"use strict";
var http    = require('http'),
    fs      = require('fs'),
    path    = require('path');

var config = require('./config');

//FIXME dyrice is trying to use tiki before the download is complete.
// So we need implement message passing using EventEmitter or Promises. 

var Dependency = exports.Dependency = function() {
    this.tiki = '';
    this.tikiComponents = 3;
    this.tikiComponentsDownloaded = 0;
    this.tikiPreamble = '';
    this.tikiPostamble = '';
};

Dependency.prototype._install = function(name, data) {
    fs.writeFileSync(config.dependencies[name].install_to, data);
    console.log('[Dependency] '+ name + ' installed in ' + config.dependencies[name].install_to);
};

Dependency.prototype.installJQuery = function(name, data) {
	data = '"define metadata";({});"end";\n' + data;
	data += 'exports.$ = $.noConflict(true);';
	this._install(name, data);
};


Dependency.prototype.installTiki = function(name, data) {
    if(name == 'tiki_preamble') {
        this.tikiPreamble = data;
    } else if(name == 'tiki_postamble') {
        this.tikiPostamble = data;
    } else {
        this.tiki = data;
    }
    
	this.tikiComponentsDownloaded++;
	
	if(this.tikiComponentsDownloaded === this.tikiComponents) {
	    var template = fs.readFileSync(config.embedded.tiki_template, 'utf8');
        
        template = template.replace('TIKI_PREAMBLE', this.tikiPreamble);
        template = template.replace(/TIKI_PACKAGE_ID/g, '::tiki/1.0.0');
        template = template.replace('TIKI_VERSION', '1.0.0');
        template = template.replace('TIKI_BODY', this.tiki);
        template = template.replace('TIKI_POSTAMBLE', this.tikiPostamble);
	    
	    this._install('tiki', template);	    
	}
};

Dependency.prototype._get = function(depname, host, uri) {
	var self = this;
	var file = http.createClient(80, host);
	var request = file.request('GET', uri, {'host': host});
	request.end();

	var data = '';
	request.on('response', function(response) {
		response.setEncoding('utf8');
		
		response.on('data', function(chunk) {
			data += chunk;
		});
		
		response.on('end', function(){
			if(depname == 'jquery') {
				self.installJQuery(depname, data);
			} else if(depname.match('tiki')) {
				self.installTiki(depname, data);
			} else {
				self._install(depname, data);
			}
		});
	});
};

Dependency.prototype.install = function() {
	var deps = config.dependencies;
	for(var name in deps) {
        if(!path.existsSync(deps[name].install_to)) {
            console.log('[Dependency] Downloading ' + name + '...');
		    this._get(name, deps[name].host, deps[name].uri);
	    } else {
	        console.log('[Dependency] ' + name + ' already exists. Skipping');
	    }
	}
};