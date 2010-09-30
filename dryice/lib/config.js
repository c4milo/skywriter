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

var config = exports;

var version = {	number: '0.9a2',
				name: 'Edison',
                api: 4
			};

var embedded = {	files: {
						shared: 'SkywriterEmbedded.js', 
						main: 'SkywriterMain.js',
						worker: 'SkywriterWorker.js',
						css: 'SkywriterEmbedded.css'
					}, 
					
					boot: 'dryice/assets/boot.js',
					preamble: 'dryice/assets/preamble.js',
					script2loader: 'dryice/assets/script2loader.js',
					tiki_template: 'dryice/assets/tiki_template.js',
					tiki_module: 'dryice/assets/tiki_module.js',
					tiki_register: 'dryice/assets/tiki_register.js',
					tiki_package: 'dryice/assets/tiki_package.js',
					templater_wrap: 'dryice/assets/templater_wrap.js',
					
					loader: 'platform/embedded/static/tiki.js',
					worker: 'platform/embedded/static/worker.js',
					 
	                plugins_path: { supported: 'plugins/supported', 
                                    thirdparty: 'plugins/thirdparty',
                                    labs: 'plugins/labs',
                                    boot: 'plugins/boot'
                                }
				};
								
var plugins_path = {	supported: 'platform/browser/plugins/supported', 
						thirdparty: 'platform/browser/plugins/thirdparty', 
						labs: 'platform/browser/plugins/labs', 
						boot: 'platform/browser/plugins/boot' 
					};
					
var dependencies = {	jquery: {   host: 'code.jquery.com', uri: '/jquery-1.4.2.js', 
                                    install_to: 'platform/browser/plugins/thirdparty/jquery.js'},
                        tiki_preamble:  {   host: 'github.com', uri: '/pcwalton/tiki/raw/master/__preamble__.js', 
                                            install_to: 'platform/embedded/static/tiki.js'},
						tiki_postamble: {   host: 'github.com', uri: '/pcwalton/tiki/raw/master/__postamble__.js', 
                                            install_to: 'platform/embedded/static/tiki.js'},
                        tiki:           {   host: 'github.com', uri: '/pcwalton/tiki/raw/master/lib/tiki.js', 
                                            install_to: 'platform/embedded/static/tiki.js'}
					};

config.version = version;
config.embedded = embedded;
config.plugins_path = plugins_path;
config.dependencies = dependencies;


