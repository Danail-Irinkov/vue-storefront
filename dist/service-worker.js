/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["dist/app.aa72533ad9019c533dd0.js","f2ec2927398a8c75f68a07f36acffa1d"],["dist/app.aa72533ad9019c533dd0.js.map","f1eed6a735f4ad3f5916e56e84740882"],["dist/core-service-worker.js","5e7184505900d75c818a02b2cb300a3b"],["dist/core-service-worker.js.map","45265a2d2814fa9a395029d6ff37cf81"],["dist/dayjs-locales0.aa72533ad9019c533dd0.js","dd4dd3579c5577f5245433438770f2ca"],["dist/dayjs-locales0.aa72533ad9019c533dd0.js.map","5eaf0beb9c268e96f8418990bb12e07e"],["dist/dayjs-locales10.aa72533ad9019c533dd0.js","d5b459a12448a2cf02e5a6aa268de6d6"],["dist/dayjs-locales10.aa72533ad9019c533dd0.js.map","d797728398b37201d59f3b6cdf10a961"],["dist/dayjs-locales100.aa72533ad9019c533dd0.js","4b4857953bfebfd9ce60ba4bece217ae"],["dist/dayjs-locales100.aa72533ad9019c533dd0.js.map","c520339faf01e3f1b303eb8f116c61b4"],["dist/dayjs-locales102.aa72533ad9019c533dd0.js","bfd228a2940d785b8d72e783887ebcf7"],["dist/dayjs-locales102.aa72533ad9019c533dd0.js.map","fd4045bfcc78acac065873fcd8bdbec6"],["dist/dayjs-locales104.aa72533ad9019c533dd0.js","2baf90b9e45ef844da49a1c41cd9dd65"],["dist/dayjs-locales104.aa72533ad9019c533dd0.js.map","7825a42f62d31987532b1e6ac6131108"],["dist/dayjs-locales106.aa72533ad9019c533dd0.js","85527701111ac1e7540f1738e627a63a"],["dist/dayjs-locales106.aa72533ad9019c533dd0.js.map","22fb322338f5f149410f3429de212358"],["dist/dayjs-locales108.aa72533ad9019c533dd0.js","246323e66e77d90a5b94b18e3e4b49be"],["dist/dayjs-locales108.aa72533ad9019c533dd0.js.map","8d1bbf3d972b45944e80033ba96d2e66"],["dist/dayjs-locales110.aa72533ad9019c533dd0.js","efce809ec932fa0db5cd5d63a4583343"],["dist/dayjs-locales110.aa72533ad9019c533dd0.js.map","0c26080a068ee8606c8c8634ef877d21"],["dist/dayjs-locales112.aa72533ad9019c533dd0.js","e2bfa109689e263273c7d6d06c077510"],["dist/dayjs-locales112.aa72533ad9019c533dd0.js.map","fbc9fd8772787621f598808e9060a84b"],["dist/dayjs-locales114.aa72533ad9019c533dd0.js","1b76304b5c60291a3ddc47b261a3f37e"],["dist/dayjs-locales114.aa72533ad9019c533dd0.js.map","092e82d283957c9c98ac81cb41737d45"],["dist/dayjs-locales116.aa72533ad9019c533dd0.js","dc84f8c2d4e6692db6b616222a57d19d"],["dist/dayjs-locales116.aa72533ad9019c533dd0.js.map","d4feb357c41e83eed74ebf09a8c18ff8"],["dist/dayjs-locales118.aa72533ad9019c533dd0.js","51aed85ac60da6edb6555740bdb61384"],["dist/dayjs-locales118.aa72533ad9019c533dd0.js.map","76c3f3f83af0529c0569baea1d4dc770"],["dist/dayjs-locales12.aa72533ad9019c533dd0.js","59de8412325b1e7bf12c42f799f4d330"],["dist/dayjs-locales12.aa72533ad9019c533dd0.js.map","f00fe0519a461363fe258c224a04ae79"],["dist/dayjs-locales120.aa72533ad9019c533dd0.js","5822079107ac7a3aee246a690d09719f"],["dist/dayjs-locales120.aa72533ad9019c533dd0.js.map","8392a72cdcac8c7e6dbca063a51edc70"],["dist/dayjs-locales122.aa72533ad9019c533dd0.js","812747667a7d332bf422eb6761a70b37"],["dist/dayjs-locales122.aa72533ad9019c533dd0.js.map","27d70038d653444916944164244fc4cb"],["dist/dayjs-locales124.aa72533ad9019c533dd0.js","86c8b04c24bdc600c7aeb1cb27f4ec21"],["dist/dayjs-locales124.aa72533ad9019c533dd0.js.map","ace91c0787696f1e4fb5c0d3c1c7dc96"],["dist/dayjs-locales126.aa72533ad9019c533dd0.js","2072d5aac429238a8acf134b0646ca88"],["dist/dayjs-locales126.aa72533ad9019c533dd0.js.map","71cbd079c8f98076e0925cb242900d64"],["dist/dayjs-locales128.aa72533ad9019c533dd0.js","2507c5be27705c145d8b4f3a7362c6c1"],["dist/dayjs-locales128.aa72533ad9019c533dd0.js.map","a8581087a578cb8252d7aee9ff1e1843"],["dist/dayjs-locales130.aa72533ad9019c533dd0.js","b3d95089017d22b7ff76ebd77a1dc1d5"],["dist/dayjs-locales130.aa72533ad9019c533dd0.js.map","43445137a080db7f1d3ef86b86950e9f"],["dist/dayjs-locales132.aa72533ad9019c533dd0.js","9e331406229ba884de140e90b923741a"],["dist/dayjs-locales132.aa72533ad9019c533dd0.js.map","9b8fb0563234bc9d9c9c5d57fc51d11e"],["dist/dayjs-locales134.aa72533ad9019c533dd0.js","be8cec10939ae7ecf35d87d245684702"],["dist/dayjs-locales134.aa72533ad9019c533dd0.js.map","1e26ad1f32fea8c8a0f2f1d9c0295937"],["dist/dayjs-locales136.aa72533ad9019c533dd0.js","0618f717b04172bdd05919918e652060"],["dist/dayjs-locales136.aa72533ad9019c533dd0.js.map","a0a297b681159d2947f042716556cad1"],["dist/dayjs-locales138.aa72533ad9019c533dd0.js","bd30ae33bcef7a7aeaf82995fac5249b"],["dist/dayjs-locales138.aa72533ad9019c533dd0.js.map","f24b9f297deac6dadcfe7b7a09c48c90"],["dist/dayjs-locales14.aa72533ad9019c533dd0.js","9c88583a18d58a41eebf61f057d6eab4"],["dist/dayjs-locales14.aa72533ad9019c533dd0.js.map","5314a0a21e7d4a1c9ff015d753bac4cf"],["dist/dayjs-locales140.aa72533ad9019c533dd0.js","b21d7ed039d35ba38081c16b78b4b8a9"],["dist/dayjs-locales140.aa72533ad9019c533dd0.js.map","b4fa90d595f78c3099a15b72d9a0777c"],["dist/dayjs-locales142.aa72533ad9019c533dd0.js","1b0c1ac9267e60a118d750719389812d"],["dist/dayjs-locales142.aa72533ad9019c533dd0.js.map","65ef729e337ce8ea990f8a2db27f1482"],["dist/dayjs-locales144.aa72533ad9019c533dd0.js","5c669a4ce437e1e076dc321812113a44"],["dist/dayjs-locales144.aa72533ad9019c533dd0.js.map","0e38fe5ab723cdf5898066230ee72053"],["dist/dayjs-locales146.aa72533ad9019c533dd0.js","8f22adee8dbf67205504fcaedd640123"],["dist/dayjs-locales146.aa72533ad9019c533dd0.js.map","ae76fafc78f67dcc42fa1267dbd24424"],["dist/dayjs-locales148.aa72533ad9019c533dd0.js","57f03f20d271eb91090e3de2b185320c"],["dist/dayjs-locales148.aa72533ad9019c533dd0.js.map","bcbcf8abd7f3b13c9448bd3327fab206"],["dist/dayjs-locales150.aa72533ad9019c533dd0.js","bb551778c11f837cb09168679c5eff4a"],["dist/dayjs-locales150.aa72533ad9019c533dd0.js.map","428c1416a2239dccd0a84e4fe09646aa"],["dist/dayjs-locales152.aa72533ad9019c533dd0.js","5c968d55eeec1d8ed2e1b6b0de0551a6"],["dist/dayjs-locales152.aa72533ad9019c533dd0.js.map","949e9ea511aa092f54c4e70be70505cc"],["dist/dayjs-locales154.aa72533ad9019c533dd0.js","343eaece683337906fdb601a35f799d5"],["dist/dayjs-locales154.aa72533ad9019c533dd0.js.map","5526fb855f83fba9b16c4a5094f98bcb"],["dist/dayjs-locales156.aa72533ad9019c533dd0.js","18c9a2b0e554fc0f41781c6bf7e5ebcd"],["dist/dayjs-locales156.aa72533ad9019c533dd0.js.map","7ac7e68fd558dd0ae8101c0d8c3d9017"],["dist/dayjs-locales158.aa72533ad9019c533dd0.js","bd64ec17c7fd7f03871f71a492ed2a7e"],["dist/dayjs-locales158.aa72533ad9019c533dd0.js.map","8e49a0a048e3c0fe453a00445eda2291"],["dist/dayjs-locales16.aa72533ad9019c533dd0.js","30370f0308ccba5585ecbe0269156685"],["dist/dayjs-locales16.aa72533ad9019c533dd0.js.map","32759aa449a4fd5ecc74c209b170a2d2"],["dist/dayjs-locales160.aa72533ad9019c533dd0.js","77da17b74343d701ed6f1555beb50216"],["dist/dayjs-locales160.aa72533ad9019c533dd0.js.map","ab4915d035e7ca877674feb0796e9710"],["dist/dayjs-locales162.aa72533ad9019c533dd0.js","c9531fd5f63fa40aa9569c6c69c77325"],["dist/dayjs-locales162.aa72533ad9019c533dd0.js.map","0e8661b6bceb583a28daab5c0ba3669f"],["dist/dayjs-locales164.aa72533ad9019c533dd0.js","6e730b6b907214f8b6fa6e0112b29117"],["dist/dayjs-locales164.aa72533ad9019c533dd0.js.map","256faf6f5c7a0c1735d8290c5ffe82fc"],["dist/dayjs-locales166.aa72533ad9019c533dd0.js","6fa396ecd12018854459c79c424ed212"],["dist/dayjs-locales166.aa72533ad9019c533dd0.js.map","c24717de3efaf12222ea277578bb8f70"],["dist/dayjs-locales168.aa72533ad9019c533dd0.js","b002fa281ac431c1eebdb4945ab32546"],["dist/dayjs-locales168.aa72533ad9019c533dd0.js.map","1fe7c7588d5b28bd01e302fdbcd1c2b5"],["dist/dayjs-locales170.aa72533ad9019c533dd0.js","1da99a163007bec2b11693b420bcd932"],["dist/dayjs-locales170.aa72533ad9019c533dd0.js.map","07e71a3dfb28be03d102f7cd034e05e1"],["dist/dayjs-locales172.aa72533ad9019c533dd0.js","a8e1068df1d9a1654061987a768b059f"],["dist/dayjs-locales172.aa72533ad9019c533dd0.js.map","2af4c47f4939f55ee1b6f437c1be8695"],["dist/dayjs-locales174.aa72533ad9019c533dd0.js","8f47ad4feb6c9a7fec21e5f444ab9e92"],["dist/dayjs-locales174.aa72533ad9019c533dd0.js.map","07b52aa7b3be531212c866e9ed6e48a8"],["dist/dayjs-locales176.aa72533ad9019c533dd0.js","4be33504442e25e1f9bd90bb9b4b6570"],["dist/dayjs-locales176.aa72533ad9019c533dd0.js.map","74994a3b523e180455ed115863c59c6e"],["dist/dayjs-locales178.aa72533ad9019c533dd0.js","c2f69e3711b2e4c9b8edab8c7f2f6458"],["dist/dayjs-locales178.aa72533ad9019c533dd0.js.map","62ef991afbb68c33051c4b0c1e44cae8"],["dist/dayjs-locales18.aa72533ad9019c533dd0.js","3177309464295fcb251f09447b610350"],["dist/dayjs-locales18.aa72533ad9019c533dd0.js.map","eb088f281eb080f154b6e869b508764b"],["dist/dayjs-locales180.aa72533ad9019c533dd0.js","ea6cfcd5bb1a42970678badaef4d139c"],["dist/dayjs-locales180.aa72533ad9019c533dd0.js.map","f76ae3fe4fde7772d22121c8e587819c"],["dist/dayjs-locales182.aa72533ad9019c533dd0.js","4862dc8d1aeab73e237dc2f1187bac24"],["dist/dayjs-locales182.aa72533ad9019c533dd0.js.map","f5daf063e3948d955a22e330504c6852"],["dist/dayjs-locales184.aa72533ad9019c533dd0.js","1798955bbec14546e92167108d5b4e4e"],["dist/dayjs-locales184.aa72533ad9019c533dd0.js.map","d7d2590625546e15893c0fa0d11add7b"],["dist/dayjs-locales186.aa72533ad9019c533dd0.js","5224f258dd5ba0fea484a7065591e1b5"],["dist/dayjs-locales186.aa72533ad9019c533dd0.js.map","8de7ecf63989464941d7bc9894e46cc1"],["dist/dayjs-locales188.aa72533ad9019c533dd0.js","9d75bee6a3ce3a87b12d8880488b3d8f"],["dist/dayjs-locales188.aa72533ad9019c533dd0.js.map","c9fb5ce5281f174084670cae81144cf1"],["dist/dayjs-locales190.aa72533ad9019c533dd0.js","6569faf0addc2d69bcbcdadc1830ef15"],["dist/dayjs-locales190.aa72533ad9019c533dd0.js.map","8a6fb9b79c91e912487ad39570d628de"],["dist/dayjs-locales192.aa72533ad9019c533dd0.js","6f1ce7b59da6fd05266fdf1b7500d204"],["dist/dayjs-locales192.aa72533ad9019c533dd0.js.map","ba2e49613d3131106cd038451398170e"],["dist/dayjs-locales194.aa72533ad9019c533dd0.js","1893d2a560ea1010b653fabdceef462a"],["dist/dayjs-locales194.aa72533ad9019c533dd0.js.map","3beb332290e6ce7e3e3beab91557f2e7"],["dist/dayjs-locales196.aa72533ad9019c533dd0.js","a94c3210bdbee81853846c30219c5edd"],["dist/dayjs-locales196.aa72533ad9019c533dd0.js.map","4201d6a59c7d0a54b7184466849da3a9"],["dist/dayjs-locales198.aa72533ad9019c533dd0.js","ec229d5af033147328c759cb53b9c522"],["dist/dayjs-locales198.aa72533ad9019c533dd0.js.map","e029bf71a1e07f8006f38485620cc82e"],["dist/dayjs-locales2.aa72533ad9019c533dd0.js","e0d36c2b2b5a19b868669fce36f81831"],["dist/dayjs-locales2.aa72533ad9019c533dd0.js.map","717d871f838d59305d1c251ff2038d06"],["dist/dayjs-locales20.aa72533ad9019c533dd0.js","89928106b35047fae02c3bbda56da2ba"],["dist/dayjs-locales20.aa72533ad9019c533dd0.js.map","f4e0dddd0aa59112f4400cefd1caea01"],["dist/dayjs-locales200.aa72533ad9019c533dd0.js","0830300fa8e7c921231c517ff9e6275e"],["dist/dayjs-locales200.aa72533ad9019c533dd0.js.map","00712e9deeb983e58a048245489e01b1"],["dist/dayjs-locales202.aa72533ad9019c533dd0.js","805d612dde661622758d223bf275f81c"],["dist/dayjs-locales202.aa72533ad9019c533dd0.js.map","fa86404bd5a668bb47f8e6c1a073455a"],["dist/dayjs-locales204.aa72533ad9019c533dd0.js","7322e80725250dacdc739f86ba965f58"],["dist/dayjs-locales204.aa72533ad9019c533dd0.js.map","2964d0a753a6aff3a46b0ba5da43ff1f"],["dist/dayjs-locales206.aa72533ad9019c533dd0.js","40954c8e5aaeb22b830a801289dd1e84"],["dist/dayjs-locales206.aa72533ad9019c533dd0.js.map","1b845aa17b59b25081eeaf6dda0b1f57"],["dist/dayjs-locales208.aa72533ad9019c533dd0.js","9d54e3e4d77ac92bec5dd60525593dae"],["dist/dayjs-locales208.aa72533ad9019c533dd0.js.map","7f0314f1fc230f7c0c1bdd7737ee8067"],["dist/dayjs-locales210.aa72533ad9019c533dd0.js","0a716a7ef67ee7976bf5ba04ae1acc80"],["dist/dayjs-locales210.aa72533ad9019c533dd0.js.map","8911b30d76a3dccf604ec2d1245a3183"],["dist/dayjs-locales212.aa72533ad9019c533dd0.js","0f5baaec51d7772cd08739789490df91"],["dist/dayjs-locales212.aa72533ad9019c533dd0.js.map","93d88b1441242b9da97c161b368748e5"],["dist/dayjs-locales214.aa72533ad9019c533dd0.js","49dff3db7a335985b67f63050dcb57ed"],["dist/dayjs-locales214.aa72533ad9019c533dd0.js.map","a8ff40cc158f61f38cdce5747bbf9499"],["dist/dayjs-locales216.aa72533ad9019c533dd0.js","3b8146a2b3b0402bbb672e220ac19232"],["dist/dayjs-locales216.aa72533ad9019c533dd0.js.map","c9838f3b1bac001c63863c450b8c0145"],["dist/dayjs-locales218.aa72533ad9019c533dd0.js","acc0e8b8222a6c14f64c1a44553966ac"],["dist/dayjs-locales218.aa72533ad9019c533dd0.js.map","1ab11b1abe345307a38e68510cb41c50"],["dist/dayjs-locales22.aa72533ad9019c533dd0.js","d55bcb896db285ac9287d28e5e372313"],["dist/dayjs-locales22.aa72533ad9019c533dd0.js.map","5880aed4955c224a26317e9752229a30"],["dist/dayjs-locales220.aa72533ad9019c533dd0.js","ab6a9740f24ee596fe8bdeb1b7097c48"],["dist/dayjs-locales220.aa72533ad9019c533dd0.js.map","b69b1a9e750645d7d7daeedf77bc902d"],["dist/dayjs-locales222.aa72533ad9019c533dd0.js","cec3bc7a84b670ca9f49b0bd0ab21ed7"],["dist/dayjs-locales222.aa72533ad9019c533dd0.js.map","1848f399ee341c54c3b03cc654611b76"],["dist/dayjs-locales224.aa72533ad9019c533dd0.js","05a5b000e8be41a05dbebb99e9f33985"],["dist/dayjs-locales224.aa72533ad9019c533dd0.js.map","eae3487fa26c5c29b94300b0a08172d9"],["dist/dayjs-locales226.aa72533ad9019c533dd0.js","29d4adb4ea9b055185a8a65dfd4f8a94"],["dist/dayjs-locales226.aa72533ad9019c533dd0.js.map","5b62b3f05c2eea43ad5b981ceadc655d"],["dist/dayjs-locales228.aa72533ad9019c533dd0.js","4fc31624658bdccdf25eb51a586d0ab3"],["dist/dayjs-locales228.aa72533ad9019c533dd0.js.map","d6ebbef3d2ee1295f8741fc5a515b109"],["dist/dayjs-locales230.aa72533ad9019c533dd0.js","886ac715f411c16a93622f047eee5b41"],["dist/dayjs-locales230.aa72533ad9019c533dd0.js.map","640e39fa4124dc2fbe5e4c10550b6ac2"],["dist/dayjs-locales232.aa72533ad9019c533dd0.js","b6bfc4e0685dbdfbd0e5f0f9062cdd97"],["dist/dayjs-locales232.aa72533ad9019c533dd0.js.map","70249b367de7431ff2bc3160c95d292a"],["dist/dayjs-locales234.aa72533ad9019c533dd0.js","b9f08060cf7aeddc3cf5c604a253e5da"],["dist/dayjs-locales234.aa72533ad9019c533dd0.js.map","44557abfaf87f7ae1bdcea28c8f7306c"],["dist/dayjs-locales236.aa72533ad9019c533dd0.js","0f757ba2ed810e83585d38dfbaa43713"],["dist/dayjs-locales236.aa72533ad9019c533dd0.js.map","7390ddfeafd9163839bc45e265ee9392"],["dist/dayjs-locales238.aa72533ad9019c533dd0.js","74b97b2b8e4f2c7d996eef1bb36769fe"],["dist/dayjs-locales238.aa72533ad9019c533dd0.js.map","057a378cdccedfbbe1ac88657a3ce296"],["dist/dayjs-locales24.aa72533ad9019c533dd0.js","4b19984b8cb23207d2b3d9e72938b209"],["dist/dayjs-locales24.aa72533ad9019c533dd0.js.map","20f01726332e80763c17bcbcb80ec87b"],["dist/dayjs-locales240.aa72533ad9019c533dd0.js","fad02ffd777e56821a0c334f76f3551e"],["dist/dayjs-locales240.aa72533ad9019c533dd0.js.map","f830a717277e77eb7ad560df7f060d1b"],["dist/dayjs-locales242.aa72533ad9019c533dd0.js","fc0ce5c4bbb3b1b844ec6dc6d128ac82"],["dist/dayjs-locales242.aa72533ad9019c533dd0.js.map","f65b4cfa3958fdc05b3f30e0d09b70bf"],["dist/dayjs-locales244.aa72533ad9019c533dd0.js","1256b1fa681dd097d1cdc9097bef4a9a"],["dist/dayjs-locales244.aa72533ad9019c533dd0.js.map","40dcba39943125fd9b1c7981c9e2023d"],["dist/dayjs-locales246.aa72533ad9019c533dd0.js","0681117c0ce7553c4cd14feadfd82b6d"],["dist/dayjs-locales246.aa72533ad9019c533dd0.js.map","25067a95d49ce89c35b83bccafffb3d5"],["dist/dayjs-locales248.aa72533ad9019c533dd0.js","d4a2c7c6c4e92c48263d3d4627a60fd5"],["dist/dayjs-locales248.aa72533ad9019c533dd0.js.map","71c523335d58374880ec740ef3bde6e5"],["dist/dayjs-locales250.aa72533ad9019c533dd0.js","fe180abc30849cc5b666a155b599f040"],["dist/dayjs-locales250.aa72533ad9019c533dd0.js.map","e5429cf17825e632932d920e650c4031"],["dist/dayjs-locales252.aa72533ad9019c533dd0.js","3fffda614a8e781d9be808c35e1d9706"],["dist/dayjs-locales252.aa72533ad9019c533dd0.js.map","e29cd5b07513529b757cfb335f76bb67"],["dist/dayjs-locales254.aa72533ad9019c533dd0.js","5849c75d281e5a2eb008f4bc9ebef5b0"],["dist/dayjs-locales254.aa72533ad9019c533dd0.js.map","8971c25889cac80d5c762ec9a9da2dd5"],["dist/dayjs-locales256.aa72533ad9019c533dd0.js","c4cc7cf7b332582fcd700660991d5b7f"],["dist/dayjs-locales256.aa72533ad9019c533dd0.js.map","81f772f3b5ab1ea3991bcefb243bf193"],["dist/dayjs-locales26.aa72533ad9019c533dd0.js","2707df8093d9f1719a28291d131cc02d"],["dist/dayjs-locales26.aa72533ad9019c533dd0.js.map","a6b3ef7dc222aa31e2fd44b5f3715e85"],["dist/dayjs-locales28.aa72533ad9019c533dd0.js","a8a80315ee357b4b6ce6947570d59e2b"],["dist/dayjs-locales28.aa72533ad9019c533dd0.js.map","e1d9d5164c8f13ee18a425d0ab5cbd5a"],["dist/dayjs-locales30.aa72533ad9019c533dd0.js","efa6a9344b9ce85566a3358419825533"],["dist/dayjs-locales30.aa72533ad9019c533dd0.js.map","f64f68822740166d3cc60d731ec47c8c"],["dist/dayjs-locales32.aa72533ad9019c533dd0.js","c780dbda26ad565ddec8bbeaab84fead"],["dist/dayjs-locales32.aa72533ad9019c533dd0.js.map","277191307197802963cb51fed6065fa3"],["dist/dayjs-locales34.aa72533ad9019c533dd0.js","6b04cdd7b7c1a1b42b3a26b80b2b6080"],["dist/dayjs-locales34.aa72533ad9019c533dd0.js.map","bbe1d8ed439ee5c51d07d6b31127b165"],["dist/dayjs-locales36.aa72533ad9019c533dd0.js","e9e2be71b88d16f74ee99e0dc09105b7"],["dist/dayjs-locales36.aa72533ad9019c533dd0.js.map","f7b1882d1922ed384659626dc011f176"],["dist/dayjs-locales38.aa72533ad9019c533dd0.js","aa9356cf01987d68c691c51b574f3600"],["dist/dayjs-locales38.aa72533ad9019c533dd0.js.map","1185660ea080d82753b07bc8d3e4d202"],["dist/dayjs-locales4.aa72533ad9019c533dd0.js","bf3a6e9751b4edf02fc6a5d8fceeac92"],["dist/dayjs-locales4.aa72533ad9019c533dd0.js.map","9e01a2d666969a71f505a7c78c53f87b"],["dist/dayjs-locales40.aa72533ad9019c533dd0.js","9dae7a97be059242c7ebefaa1fdc1edd"],["dist/dayjs-locales40.aa72533ad9019c533dd0.js.map","635d58a9eea8ca8c324f0631f2cde529"],["dist/dayjs-locales42.aa72533ad9019c533dd0.js","705e12e38aaa25f60119ae03c3367d9b"],["dist/dayjs-locales42.aa72533ad9019c533dd0.js.map","a7e679dd1a87942d8fe19bea66fecab5"],["dist/dayjs-locales44.aa72533ad9019c533dd0.js","3c9ec00ed3f487530c12c507fd1cc580"],["dist/dayjs-locales44.aa72533ad9019c533dd0.js.map","d90261f6fb605b840a9ed1178d05d36e"],["dist/dayjs-locales46.aa72533ad9019c533dd0.js","4bc2c71240ffe1f87631c8d963238774"],["dist/dayjs-locales46.aa72533ad9019c533dd0.js.map","b7307bf3bc93ba080cc133174756783d"],["dist/dayjs-locales48.aa72533ad9019c533dd0.js","c2f1f5502676075a2a38d348a8890c98"],["dist/dayjs-locales48.aa72533ad9019c533dd0.js.map","bd1d2cf45b388933927b50a05fbae20a"],["dist/dayjs-locales50.aa72533ad9019c533dd0.js","bbe9c58f6f914a584084f90bef0e3a0c"],["dist/dayjs-locales50.aa72533ad9019c533dd0.js.map","0bae2d046dd145e25baa9cb2b88e7090"],["dist/dayjs-locales52.aa72533ad9019c533dd0.js","67c240e6dc77e52064a42fbbe3712c22"],["dist/dayjs-locales52.aa72533ad9019c533dd0.js.map","63bd01f71c512dcd44dcb8a6562f88c4"],["dist/dayjs-locales54.aa72533ad9019c533dd0.js","c07e1de317f0e552e1628204da43442a"],["dist/dayjs-locales54.aa72533ad9019c533dd0.js.map","0eacebdfd8191bd145fb0e286af4d21e"],["dist/dayjs-locales56.aa72533ad9019c533dd0.js","79d1523e078b436e5a014b97d9953dfb"],["dist/dayjs-locales56.aa72533ad9019c533dd0.js.map","d51994374898001880ea2a957b2d4cc8"],["dist/dayjs-locales58.aa72533ad9019c533dd0.js","de3366eacfe4c34d6f04ea50a32dc187"],["dist/dayjs-locales58.aa72533ad9019c533dd0.js.map","318dee6ecd4192549f53bbe530c6cc2a"],["dist/dayjs-locales6.aa72533ad9019c533dd0.js","3877a568f41785088bf75f0e5b71aa0d"],["dist/dayjs-locales6.aa72533ad9019c533dd0.js.map","59b5bf7254a2a4d23094de6ade35c350"],["dist/dayjs-locales60.aa72533ad9019c533dd0.js","51b4653792567417414c81d7de6a47d5"],["dist/dayjs-locales60.aa72533ad9019c533dd0.js.map","46f9855014af0722b09dba8a9c85e96e"],["dist/dayjs-locales62.aa72533ad9019c533dd0.js","c3aebeb8fb1ef01e1ccda2273fee6860"],["dist/dayjs-locales62.aa72533ad9019c533dd0.js.map","99c6ae9ae78640fd73dc44318a88d644"],["dist/dayjs-locales64.aa72533ad9019c533dd0.js","73a4000394e0f2bfe3ffb892acc2b9d2"],["dist/dayjs-locales64.aa72533ad9019c533dd0.js.map","3f16ef10524806a2f20469122109a007"],["dist/dayjs-locales66.aa72533ad9019c533dd0.js","96694d6822bb22538b6db0ad099a62cc"],["dist/dayjs-locales66.aa72533ad9019c533dd0.js.map","c2458ab2cf5822e1824838774b2ed6ec"],["dist/dayjs-locales68.aa72533ad9019c533dd0.js","c039920cc011cff60dd1c174178d1104"],["dist/dayjs-locales68.aa72533ad9019c533dd0.js.map","f72ffa51b58b94f8d712fe22d46216f2"],["dist/dayjs-locales70.aa72533ad9019c533dd0.js","f9627c2b0756e21200866627f7ca45f4"],["dist/dayjs-locales70.aa72533ad9019c533dd0.js.map","7c3c43cb61e3100b0dbdc18742d3f926"],["dist/dayjs-locales72.aa72533ad9019c533dd0.js","6c089ed1456e6a01f6c45c7b51531b0d"],["dist/dayjs-locales72.aa72533ad9019c533dd0.js.map","658c00548d74d53f0824092311357370"],["dist/dayjs-locales74.aa72533ad9019c533dd0.js","b7389add126ca8063227429bc7096f81"],["dist/dayjs-locales74.aa72533ad9019c533dd0.js.map","b4e20ef70b5d7ba3f1143327d5945b5c"],["dist/dayjs-locales76.aa72533ad9019c533dd0.js","6897db445c0a90ba1534d1ed60202546"],["dist/dayjs-locales76.aa72533ad9019c533dd0.js.map","374fdc0cfb3c7ec07940f805788fb35b"],["dist/dayjs-locales78.aa72533ad9019c533dd0.js","f5a06e46ac069a51021df3f9063f88cf"],["dist/dayjs-locales78.aa72533ad9019c533dd0.js.map","4276a5afe25c2d89ca49e2a1cad31f7e"],["dist/dayjs-locales8.aa72533ad9019c533dd0.js","56bb2bdafeac1f533256d44ba2de16cb"],["dist/dayjs-locales8.aa72533ad9019c533dd0.js.map","1ce7e6e7d0384e7138e103769a6585cc"],["dist/dayjs-locales80.aa72533ad9019c533dd0.js","9841aada73fcb6ad92fc09137fea1a2a"],["dist/dayjs-locales80.aa72533ad9019c533dd0.js.map","04417ee5d6578db7cb7b67e37278dc3a"],["dist/dayjs-locales82.aa72533ad9019c533dd0.js","5087f67f404a68f02a675f2fbb3b8b68"],["dist/dayjs-locales82.aa72533ad9019c533dd0.js.map","83c9444a72a9e9096560980572c3892d"],["dist/dayjs-locales84.aa72533ad9019c533dd0.js","7712ed000ee71b18702f5bc96fcbe39e"],["dist/dayjs-locales84.aa72533ad9019c533dd0.js.map","1536b4d6c11260a5df79103e21704a8a"],["dist/dayjs-locales86.aa72533ad9019c533dd0.js","8ac6cb43927b52c9f51daeb582dcfd76"],["dist/dayjs-locales86.aa72533ad9019c533dd0.js.map","b655cd5f39f8017c7b266af7baf891a3"],["dist/dayjs-locales88.aa72533ad9019c533dd0.js","d7659faccb14d2c4d96f783f962ec218"],["dist/dayjs-locales88.aa72533ad9019c533dd0.js.map","381d4693e8dc5e4c423d90a15fda923a"],["dist/dayjs-locales90.aa72533ad9019c533dd0.js","5299235a14f649b7e8c164444eb5fdc4"],["dist/dayjs-locales90.aa72533ad9019c533dd0.js.map","5102540ae7d282cb3d8152ca2704433a"],["dist/dayjs-locales92.aa72533ad9019c533dd0.js","cb12fcf8ad9962500521115bd54c1e24"],["dist/dayjs-locales92.aa72533ad9019c533dd0.js.map","0b72a524052648801244d39ed506e100"],["dist/dayjs-locales94.aa72533ad9019c533dd0.js","507651a7a4ed8ca0d163ff01c646273c"],["dist/dayjs-locales94.aa72533ad9019c533dd0.js.map","49c30b2699f0c18908842aa156b97e3c"],["dist/dayjs-locales96.aa72533ad9019c533dd0.js","6e859fcf0651694be4ddab1735ce4ad0"],["dist/dayjs-locales96.aa72533ad9019c533dd0.js.map","c94226a0632fb8a8898d6df3423acdb1"],["dist/dayjs-locales98.aa72533ad9019c533dd0.js","a6df98f08dc6e4abb24a5c4103e10c5c"],["dist/dayjs-locales98.aa72533ad9019c533dd0.js.map","ab88cbfdba9dd939caf5c9a15dd5e8f2"],["dist/index.amp.html","4e195790dbabc8ce974abe504ec2dc9f"],["dist/index.basic.html","486e00b7990c42308478a7f65350f98c"],["dist/index.html","1265d937a5a512255b975a0da6ef5524"],["dist/index.minimal.html","cb06ddd66816ea42fe4a47407082095d"],["dist/manifest.aa72533ad9019c533dd0.js","f528c720dca8273e753838e85869b2cd"],["dist/manifest.aa72533ad9019c533dd0.js.map","79ae1918502f118055e61214f9c2b383"],["dist/vendor.aa72533ad9019c533dd0.js","421ae412226181d4e3dc2a500ac5832a"],["dist/vendor.aa72533ad9019c533dd0.js.map","4623041ec5c6fc71d5733d734b93eef2"],["dist/vendors~bodybuilder.aa72533ad9019c533dd0.js","5f944c786e0e036670dd58e785b10df5"],["dist/vendors~bodybuilder.aa72533ad9019c533dd0.js.map","eb6399bc00679dfeec838cc1fe62c8ba"],["dist/vendors~vsf-graphql.aa72533ad9019c533dd0.js","6bb2440323976d6ac6811e0c6731f7ee"],["dist/vendors~vsf-graphql.aa72533ad9019c533dd0.js.map","7868c3a8dfb484a49f438213d8264bbe"],["dist/vsf-category.aa72533ad9019c533dd0.js","14887066d2041c0261b5ed07228758e6"],["dist/vsf-category.aa72533ad9019c533dd0.js.map","2b1a5e866be3f0e9fc8b2cd3b5438da2"],["dist/vsf-checkout.aa72533ad9019c533dd0.js","f3ebe4383c523331301502067eb7df63"],["dist/vsf-checkout.aa72533ad9019c533dd0.js.map","53b9fc6327b89b683124166e140cfe65"],["dist/vsf-checkout~vsf-layout-default~vsf-product.aa72533ad9019c533dd0.js","bee700891e00aaf689ff1dd108e418aa"],["dist/vsf-checkout~vsf-layout-default~vsf-product.aa72533ad9019c533dd0.js.map","15b8a7a35cc2287d7577babc747f7385"],["dist/vsf-checkout~vsf-my-account.aa72533ad9019c533dd0.js","bc3da25f8a96ab4a496f137b7ca0fdfb"],["dist/vsf-checkout~vsf-my-account.aa72533ad9019c533dd0.js.map","d8cb51de8618d675b128d755bed5f9a0"],["dist/vsf-cms.aa72533ad9019c533dd0.js","63130e66a474be2ca96243579dbf1e59"],["dist/vsf-cms.aa72533ad9019c533dd0.js.map","8bf74b3826e4f66cf7c07abb72a0745a"],["dist/vsf-compare.aa72533ad9019c533dd0.js","20c604cd7638cc98e374b3045a153101"],["dist/vsf-compare.aa72533ad9019c533dd0.js.map","3e14255fb6b6faeb0de0a00d23c65243"],["dist/vsf-error.aa72533ad9019c533dd0.js","af75ab1144bb16a3307b169fb04d8d22"],["dist/vsf-error.aa72533ad9019c533dd0.js.map","388625baf39619900dad40e097dd3a7a"],["dist/vsf-head-img-banners-de_main-image-json.aa72533ad9019c533dd0.js","3655cbb2a5d9c3efa3af1a0ddf954118"],["dist/vsf-head-img-banners-de_main-image-json.aa72533ad9019c533dd0.js.map","a9555fc0499843c04c74f7b681cf1185"],["dist/vsf-head-img-banners-de_promoted_offers-json.aa72533ad9019c533dd0.js","892d4ede75ef5042d924110179abba18"],["dist/vsf-head-img-banners-de_promoted_offers-json.aa72533ad9019c533dd0.js.map","df8286e64cdc4c0f11cf00265532accc"],["dist/vsf-head-img-banners-it_main-image-json.aa72533ad9019c533dd0.js","439a9f521a91a6c42c890c341eb6ec95"],["dist/vsf-head-img-banners-it_main-image-json.aa72533ad9019c533dd0.js.map","bd1c4225d05b4ac07c8db31bee63f2c3"],["dist/vsf-head-img-banners-it_promoted_offers-json.aa72533ad9019c533dd0.js","68e127c4e9c86c3324bcd7f963f2f80d"],["dist/vsf-head-img-banners-it_promoted_offers-json.aa72533ad9019c533dd0.js.map","469cb8f14367cbc9f7ef5460280e4411"],["dist/vsf-head-img-main-image-json.aa72533ad9019c533dd0.js","1a0f321e47bd2db6631093d436e70cf0"],["dist/vsf-head-img-main-image-json.aa72533ad9019c533dd0.js.map","c97a63a3b7b484b6f316c57163ef34f9"],["dist/vsf-head-img-promoted_offers-json.aa72533ad9019c533dd0.js","03983f4024f32d320a4d02233d6046ec"],["dist/vsf-head-img-promoted_offers-json.aa72533ad9019c533dd0.js.map","bac23474dde52361a6d73ae74e88bd28"],["dist/vsf-head-img-slider-json.aa72533ad9019c533dd0.js","1843b8c61f77aee7777e5677dc078d7f"],["dist/vsf-head-img-slider-json.aa72533ad9019c533dd0.js.map","c450556898be297b18f33a0027ac8f66"],["dist/vsf-home.aa72533ad9019c533dd0.js","00a46c0e1fc4b2cedd635ee2ff33f054"],["dist/vsf-home.aa72533ad9019c533dd0.js.map","4847381a6fcccf8ffe5b5b8194b3da6a"],["dist/vsf-languages-modal.aa72533ad9019c533dd0.js","4bbb12345165bd1d0cb7d8244057abc6"],["dist/vsf-languages-modal.aa72533ad9019c533dd0.js.map","d8e8d07fe2973b681241dbcbaaf57c5e"],["dist/vsf-layout-default.aa72533ad9019c533dd0.js","2b03ac6c3eb375e48bde60c652939501"],["dist/vsf-layout-default.aa72533ad9019c533dd0.js.map","6315c2b75fd277a4957e6b18075206f4"],["dist/vsf-layout-default~vsf-layout-minimal.aa72533ad9019c533dd0.js","a410944f9c181dddb9f1dd0bc5ce11db"],["dist/vsf-layout-default~vsf-layout-minimal.aa72533ad9019c533dd0.js.map","722ef84fcb49cb38033f4e385a010aee"],["dist/vsf-layout-empty.aa72533ad9019c533dd0.js","f375bdbc7e4ad5ae48d9ae729b0387a2"],["dist/vsf-layout-empty.aa72533ad9019c533dd0.js.map","b5b8493b5ce79fe7a310467bdb60e377"],["dist/vsf-layout-minimal.aa72533ad9019c533dd0.js","d79a2337614810a7a57ff0452e81494e"],["dist/vsf-layout-minimal.aa72533ad9019c533dd0.js.map","38ec95671e12db652fb7c7d9d26b2f4b"],["dist/vsf-microcart.aa72533ad9019c533dd0.js","a75c350a8b939278755cbeffea8bd24c"],["dist/vsf-microcart.aa72533ad9019c533dd0.js.map","59402874d0bef50c8ba9b4c8d2db4088"],["dist/vsf-my-account.aa72533ad9019c533dd0.js","c4f74fe2a5e59f351d0dbeed6aac5b15"],["dist/vsf-my-account.aa72533ad9019c533dd0.js.map","df23b80c788df48820b6f9daeff56612"],["dist/vsf-newsletter-modal.aa72533ad9019c533dd0.js","57814aab702717c67888a3c53a5a7b0a"],["dist/vsf-newsletter-modal.aa72533ad9019c533dd0.js.map","0916fbb59215d7302e782599d7c0417c"],["dist/vsf-not-found.aa72533ad9019c533dd0.js","ae245d59459c68ff391fa48c9abf3fe7"],["dist/vsf-not-found.aa72533ad9019c533dd0.js.map","ae03fc3f69785e5341bee10d35664e61"],["dist/vsf-order-confirmation.aa72533ad9019c533dd0.js","fbdb042d78a71a119ba551dee553bd8b"],["dist/vsf-order-confirmation.aa72533ad9019c533dd0.js.map","3bec372b0719ad100f4b807bb478bb62"],["dist/vsf-product-gallery-carousel.aa72533ad9019c533dd0.js","3fabb68caf90f2ea4b2dcd82fac138e2"],["dist/vsf-product-gallery-carousel.aa72533ad9019c533dd0.js.map","60b9651f3c1ad99dc8d905be9ea1e946"],["dist/vsf-product-gallery-carousel~vsf-product-gallery-zoom-carousel.aa72533ad9019c533dd0.js","f95e8ce77fb256286e4423717c5482e1"],["dist/vsf-product-gallery-carousel~vsf-product-gallery-zoom-carousel.aa72533ad9019c533dd0.js.map","52c31ce980afa6965e2fe7b7e762920c"],["dist/vsf-product-gallery-zoom-carousel.aa72533ad9019c533dd0.js","4c724cf0a3c8ec75dc83395656e1958a"],["dist/vsf-product-gallery-zoom-carousel.aa72533ad9019c533dd0.js.map","e6c62a43873b9bb5295623e89fa64adc"],["dist/vsf-product.aa72533ad9019c533dd0.js","8f2976f1325232119c94d097facad5ab"],["dist/vsf-product.aa72533ad9019c533dd0.js.map","772e556b992290ed444d918408b99b03"],["dist/vsf-search-adapter-0.aa72533ad9019c533dd0.js","96829d9dbb31400c3fd706dfb8b6d462"],["dist/vsf-search-adapter-0.aa72533ad9019c533dd0.js.map","dc8ba95913668876919c8f5fa66f1ebc"],["dist/vsf-search-adapter-1.aa72533ad9019c533dd0.js","49b32924d0d6ffa1dfd8d621010f46b2"],["dist/vsf-search-adapter-1.aa72533ad9019c533dd0.js.map","bf850fb6a85cff7fd4c00c32a21fc5b5"],["dist/vsf-search-panel.aa72533ad9019c533dd0.js","6e9b43fe64055995df4a00a1d6a383c3"],["dist/vsf-search-panel.aa72533ad9019c533dd0.js.map","b2e382e7882c466ad42c0c55e3103d65"],["dist/vsf-sidebar-menu.aa72533ad9019c533dd0.js","dadfe3a1cbca89dcf2ae3452aa28f19d"],["dist/vsf-sidebar-menu.aa72533ad9019c533dd0.js.map","1a055f0972bfdc0aace58b1274b4269f"],["dist/vsf-static.aa72533ad9019c533dd0.js","c1625678a2072695ce6e0fdd5f5b726d"],["dist/vsf-static.aa72533ad9019c533dd0.js.map","3c9082bd83f76f674ad6aeaf01684b97"],["dist/vsf-wishlist.aa72533ad9019c533dd0.js","28f49a03e73f4dd0335741a979695fdd"],["dist/vsf-wishlist.aa72533ad9019c533dd0.js.map","58c3f7ac54623c682c71c5f671ec22f4"],["dist/vue-ssr-client-manifest.json","97386220cc665423af4df5bca875939e"],["dist/wishlist.aa72533ad9019c533dd0.js","1542eabd5065843b0a2334ea165175b2"],["dist/wishlist.aa72533ad9019c533dd0.js.map","33b7890fa0d8e40243386b8f048f5bfa"]];
var cacheName = 'sw-precache-v3-vue-sfr-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});


// *** Start of auto-included sw-toolbox code. ***
/* 
 Copyright 2016 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.toolbox=e()}}(function(){return function e(t,n,r){function o(c,s){if(!n[c]){if(!t[c]){var a="function"==typeof require&&require;if(!s&&a)return a(c,!0);if(i)return i(c,!0);var u=new Error("Cannot find module '"+c+"'");throw u.code="MODULE_NOT_FOUND",u}var f=n[c]={exports:{}};t[c][0].call(f.exports,function(e){var n=t[c][1][e];return o(n?n:e)},f,f.exports,e,t,n,r)}return n[c].exports}for(var i="function"==typeof require&&require,c=0;c<r.length;c++)o(r[c]);return o}({1:[function(e,t,n){"use strict";function r(e,t){t=t||{};var n=t.debug||m.debug;n&&console.log("[sw-toolbox] "+e)}function o(e){var t;return e&&e.cache&&(t=e.cache.name),t=t||m.cache.name,caches.open(t)}function i(e,t){t=t||{};var n=t.successResponses||m.successResponses;return fetch(e.clone()).then(function(r){return"GET"===e.method&&n.test(r.status)&&o(t).then(function(n){n.put(e,r).then(function(){var r=t.cache||m.cache;(r.maxEntries||r.maxAgeSeconds)&&r.name&&c(e,n,r)})}),r.clone()})}function c(e,t,n){var r=s.bind(null,e,t,n);d=d?d.then(r):r()}function s(e,t,n){var o=e.url,i=n.maxAgeSeconds,c=n.maxEntries,s=n.name,a=Date.now();return r("Updating LRU order for "+o+". Max entries is "+c+", max age is "+i),g.getDb(s).then(function(e){return g.setTimestampForUrl(e,o,a)}).then(function(e){return g.expireEntries(e,c,i,a)}).then(function(e){r("Successfully updated IDB.");var n=e.map(function(e){return t.delete(e)});return Promise.all(n).then(function(){r("Done with cache cleanup.")})}).catch(function(e){r(e)})}function a(e,t,n){return r("Renaming cache: ["+e+"] to ["+t+"]",n),caches.delete(t).then(function(){return Promise.all([caches.open(e),caches.open(t)]).then(function(t){var n=t[0],r=t[1];return n.keys().then(function(e){return Promise.all(e.map(function(e){return n.match(e).then(function(t){return r.put(e,t)})}))}).then(function(){return caches.delete(e)})})})}function u(e,t){return o(t).then(function(t){return t.add(e)})}function f(e,t){return o(t).then(function(t){return t.delete(e)})}function h(e){e instanceof Promise||p(e),m.preCacheItems=m.preCacheItems.concat(e)}function p(e){var t=Array.isArray(e);if(t&&e.forEach(function(e){"string"==typeof e||e instanceof Request||(t=!1)}),!t)throw new TypeError("The precache method expects either an array of strings and/or Requests or a Promise that resolves to an array of strings and/or Requests.");return e}function l(e,t,n){if(!e)return!1;if(t){var r=e.headers.get("date");if(r){var o=new Date(r);if(o.getTime()+1e3*t<n)return!1}}return!0}var d,m=e("./options"),g=e("./idb-cache-expiration");t.exports={debug:r,fetchAndCache:i,openCache:o,renameCache:a,cache:u,uncache:f,precache:h,validatePrecacheInput:p,isResponseFresh:l}},{"./idb-cache-expiration":2,"./options":4}],2:[function(e,t,n){"use strict";function r(e){return new Promise(function(t,n){var r=indexedDB.open(u+e,f);r.onupgradeneeded=function(){var e=r.result.createObjectStore(h,{keyPath:p});e.createIndex(l,l,{unique:!1})},r.onsuccess=function(){t(r.result)},r.onerror=function(){n(r.error)}})}function o(e){return e in d||(d[e]=r(e)),d[e]}function i(e,t,n){return new Promise(function(r,o){var i=e.transaction(h,"readwrite"),c=i.objectStore(h);c.put({url:t,timestamp:n}),i.oncomplete=function(){r(e)},i.onabort=function(){o(i.error)}})}function c(e,t,n){return t?new Promise(function(r,o){var i=1e3*t,c=[],s=e.transaction(h,"readwrite"),a=s.objectStore(h),u=a.index(l);u.openCursor().onsuccess=function(e){var t=e.target.result;if(t&&n-i>t.value[l]){var r=t.value[p];c.push(r),a.delete(r),t.continue()}},s.oncomplete=function(){r(c)},s.onabort=o}):Promise.resolve([])}function s(e,t){return t?new Promise(function(n,r){var o=[],i=e.transaction(h,"readwrite"),c=i.objectStore(h),s=c.index(l),a=s.count();s.count().onsuccess=function(){var e=a.result;e>t&&(s.openCursor().onsuccess=function(n){var r=n.target.result;if(r){var i=r.value[p];o.push(i),c.delete(i),e-o.length>t&&r.continue()}})},i.oncomplete=function(){n(o)},i.onabort=r}):Promise.resolve([])}function a(e,t,n,r){return c(e,n,r).then(function(n){return s(e,t).then(function(e){return n.concat(e)})})}var u="sw-toolbox-",f=1,h="store",p="url",l="timestamp",d={};t.exports={getDb:o,setTimestampForUrl:i,expireEntries:a}},{}],3:[function(e,t,n){"use strict";function r(e){var t=a.match(e.request);t?e.respondWith(t(e.request)):a.default&&"GET"===e.request.method&&0===e.request.url.indexOf("http")&&e.respondWith(a.default(e.request))}function o(e){s.debug("activate event fired");var t=u.cache.name+"$$$inactive$$$";e.waitUntil(s.renameCache(t,u.cache.name))}function i(e){return e.reduce(function(e,t){return e.concat(t)},[])}function c(e){var t=u.cache.name+"$$$inactive$$$";s.debug("install event fired"),s.debug("creating cache ["+t+"]"),e.waitUntil(s.openCache({cache:{name:t}}).then(function(e){return Promise.all(u.preCacheItems).then(i).then(s.validatePrecacheInput).then(function(t){return s.debug("preCache list: "+(t.join(", ")||"(none)")),e.addAll(t)})}))}e("serviceworker-cache-polyfill");var s=e("./helpers"),a=e("./router"),u=e("./options");t.exports={fetchListener:r,activateListener:o,installListener:c}},{"./helpers":1,"./options":4,"./router":6,"serviceworker-cache-polyfill":16}],4:[function(e,t,n){"use strict";var r;r=self.registration?self.registration.scope:self.scope||new URL("./",self.location).href,t.exports={cache:{name:"$$$toolbox-cache$$$"+r+"$$$",maxAgeSeconds:null,maxEntries:null},debug:!1,networkTimeoutSeconds:null,preCacheItems:[],successResponses:/^0|([123]\d\d)|(40[14567])|410$/}},{}],5:[function(e,t,n){"use strict";var r=new URL("./",self.location),o=r.pathname,i=e("path-to-regexp"),c=function(e,t,n,r){t instanceof RegExp?this.fullUrlRegExp=t:(0!==t.indexOf("/")&&(t=o+t),this.keys=[],this.regexp=i(t,this.keys)),this.method=e,this.options=r,this.handler=n};c.prototype.makeHandler=function(e){var t;if(this.regexp){var n=this.regexp.exec(e);t={},this.keys.forEach(function(e,r){t[e.name]=n[r+1]})}return function(e){return this.handler(e,t,this.options)}.bind(this)},t.exports=c},{"path-to-regexp":15}],6:[function(e,t,n){"use strict";function r(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}var o=e("./route"),i=e("./helpers"),c=function(e,t){for(var n=e.entries(),r=n.next(),o=[];!r.done;){var i=new RegExp(r.value[0]);i.test(t)&&o.push(r.value[1]),r=n.next()}return o},s=function(){this.routes=new Map,this.routes.set(RegExp,new Map),this.default=null};["get","post","put","delete","head","any"].forEach(function(e){s.prototype[e]=function(t,n,r){return this.add(e,t,n,r)}}),s.prototype.add=function(e,t,n,c){c=c||{};var s;t instanceof RegExp?s=RegExp:(s=c.origin||self.location.origin,s=s instanceof RegExp?s.source:r(s)),e=e.toLowerCase();var a=new o(e,t,n,c);this.routes.has(s)||this.routes.set(s,new Map);var u=this.routes.get(s);u.has(e)||u.set(e,new Map);var f=u.get(e),h=a.regexp||a.fullUrlRegExp;f.has(h.source)&&i.debug('"'+t+'" resolves to same regex as existing route.'),f.set(h.source,a)},s.prototype.matchMethod=function(e,t){var n=new URL(t),r=n.origin,o=n.pathname;return this._match(e,c(this.routes,r),o)||this._match(e,[this.routes.get(RegExp)],t)},s.prototype._match=function(e,t,n){if(0===t.length)return null;for(var r=0;r<t.length;r++){var o=t[r],i=o&&o.get(e.toLowerCase());if(i){var s=c(i,n);if(s.length>0)return s[0].makeHandler(n)}}return null},s.prototype.match=function(e){return this.matchMethod(e.method,e.url)||this.matchMethod("any",e.url)},t.exports=new s},{"./helpers":1,"./route":5}],7:[function(e,t,n){"use strict";function r(e,t,n){return n=n||{},i.debug("Strategy: cache first ["+e.url+"]",n),i.openCache(n).then(function(t){return t.match(e).then(function(t){var r=n.cache||o.cache,c=Date.now();return i.isResponseFresh(t,r.maxAgeSeconds,c)?t:i.fetchAndCache(e,n)})})}var o=e("../options"),i=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],8:[function(e,t,n){"use strict";function r(e,t,n){return n=n||{},i.debug("Strategy: cache only ["+e.url+"]",n),i.openCache(n).then(function(t){return t.match(e).then(function(e){var t=n.cache||o.cache,r=Date.now();if(i.isResponseFresh(e,t.maxAgeSeconds,r))return e})})}var o=e("../options"),i=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],9:[function(e,t,n){"use strict";function r(e,t,n){return o.debug("Strategy: fastest ["+e.url+"]",n),new Promise(function(r,c){var s=!1,a=[],u=function(e){a.push(e.toString()),s?c(new Error('Both cache and network failed: "'+a.join('", "')+'"')):s=!0},f=function(e){e instanceof Response?r(e):u("No result returned")};o.fetchAndCache(e.clone(),n).then(f,u),i(e,t,n).then(f,u)})}var o=e("../helpers"),i=e("./cacheOnly");t.exports=r},{"../helpers":1,"./cacheOnly":8}],10:[function(e,t,n){t.exports={networkOnly:e("./networkOnly"),networkFirst:e("./networkFirst"),cacheOnly:e("./cacheOnly"),cacheFirst:e("./cacheFirst"),fastest:e("./fastest")}},{"./cacheFirst":7,"./cacheOnly":8,"./fastest":9,"./networkFirst":11,"./networkOnly":12}],11:[function(e,t,n){"use strict";function r(e,t,n){n=n||{};var r=n.successResponses||o.successResponses,c=n.networkTimeoutSeconds||o.networkTimeoutSeconds;return i.debug("Strategy: network first ["+e.url+"]",n),i.openCache(n).then(function(t){var s,a,u=[];if(c){var f=new Promise(function(r){s=setTimeout(function(){t.match(e).then(function(e){var t=n.cache||o.cache,c=Date.now(),s=t.maxAgeSeconds;i.isResponseFresh(e,s,c)&&r(e)})},1e3*c)});u.push(f)}var h=i.fetchAndCache(e,n).then(function(e){if(s&&clearTimeout(s),r.test(e.status))return e;throw i.debug("Response was an HTTP error: "+e.statusText,n),a=e,new Error("Bad response")}).catch(function(r){return i.debug("Network or response error, fallback to cache ["+e.url+"]",n),t.match(e).then(function(e){if(e)return e;if(a)return a;throw r})});return u.push(h),Promise.race(u)})}var o=e("../options"),i=e("../helpers");t.exports=r},{"../helpers":1,"../options":4}],12:[function(e,t,n){"use strict";function r(e,t,n){return o.debug("Strategy: network only ["+e.url+"]",n),fetch(e)}var o=e("../helpers");t.exports=r},{"../helpers":1}],13:[function(e,t,n){"use strict";var r=e("./options"),o=e("./router"),i=e("./helpers"),c=e("./strategies"),s=e("./listeners");i.debug("Service Worker Toolbox is loading"),self.addEventListener("install",s.installListener),self.addEventListener("activate",s.activateListener),self.addEventListener("fetch",s.fetchListener),t.exports={networkOnly:c.networkOnly,networkFirst:c.networkFirst,cacheOnly:c.cacheOnly,cacheFirst:c.cacheFirst,fastest:c.fastest,router:o,options:r,cache:i.cache,uncache:i.uncache,precache:i.precache}},{"./helpers":1,"./listeners":3,"./options":4,"./router":6,"./strategies":10}],14:[function(e,t,n){t.exports=Array.isArray||function(e){return"[object Array]"==Object.prototype.toString.call(e)}},{}],15:[function(e,t,n){function r(e,t){for(var n,r=[],o=0,i=0,c="",s=t&&t.delimiter||"/";null!=(n=x.exec(e));){var f=n[0],h=n[1],p=n.index;if(c+=e.slice(i,p),i=p+f.length,h)c+=h[1];else{var l=e[i],d=n[2],m=n[3],g=n[4],v=n[5],w=n[6],y=n[7];c&&(r.push(c),c="");var b=null!=d&&null!=l&&l!==d,E="+"===w||"*"===w,R="?"===w||"*"===w,k=n[2]||s,$=g||v;r.push({name:m||o++,prefix:d||"",delimiter:k,optional:R,repeat:E,partial:b,asterisk:!!y,pattern:$?u($):y?".*":"[^"+a(k)+"]+?"})}}return i<e.length&&(c+=e.substr(i)),c&&r.push(c),r}function o(e,t){return s(r(e,t))}function i(e){return encodeURI(e).replace(/[\/?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function c(e){return encodeURI(e).replace(/[?#]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function s(e){for(var t=new Array(e.length),n=0;n<e.length;n++)"object"==typeof e[n]&&(t[n]=new RegExp("^(?:"+e[n].pattern+")$"));return function(n,r){for(var o="",s=n||{},a=r||{},u=a.pretty?i:encodeURIComponent,f=0;f<e.length;f++){var h=e[f];if("string"!=typeof h){var p,l=s[h.name];if(null==l){if(h.optional){h.partial&&(o+=h.prefix);continue}throw new TypeError('Expected "'+h.name+'" to be defined')}if(v(l)){if(!h.repeat)throw new TypeError('Expected "'+h.name+'" to not repeat, but received `'+JSON.stringify(l)+"`");if(0===l.length){if(h.optional)continue;throw new TypeError('Expected "'+h.name+'" to not be empty')}for(var d=0;d<l.length;d++){if(p=u(l[d]),!t[f].test(p))throw new TypeError('Expected all "'+h.name+'" to match "'+h.pattern+'", but received `'+JSON.stringify(p)+"`");o+=(0===d?h.prefix:h.delimiter)+p}}else{if(p=h.asterisk?c(l):u(l),!t[f].test(p))throw new TypeError('Expected "'+h.name+'" to match "'+h.pattern+'", but received "'+p+'"');o+=h.prefix+p}}else o+=h}return o}}function a(e){return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g,"\\$1")}function u(e){return e.replace(/([=!:$\/()])/g,"\\$1")}function f(e,t){return e.keys=t,e}function h(e){return e.sensitive?"":"i"}function p(e,t){var n=e.source.match(/\((?!\?)/g);if(n)for(var r=0;r<n.length;r++)t.push({name:r,prefix:null,delimiter:null,optional:!1,repeat:!1,partial:!1,asterisk:!1,pattern:null});return f(e,t)}function l(e,t,n){for(var r=[],o=0;o<e.length;o++)r.push(g(e[o],t,n).source);var i=new RegExp("(?:"+r.join("|")+")",h(n));return f(i,t)}function d(e,t,n){return m(r(e,n),t,n)}function m(e,t,n){v(t)||(n=t||n,t=[]),n=n||{};for(var r=n.strict,o=n.end!==!1,i="",c=0;c<e.length;c++){var s=e[c];if("string"==typeof s)i+=a(s);else{var u=a(s.prefix),p="(?:"+s.pattern+")";t.push(s),s.repeat&&(p+="(?:"+u+p+")*"),p=s.optional?s.partial?u+"("+p+")?":"(?:"+u+"("+p+"))?":u+"("+p+")",i+=p}}var l=a(n.delimiter||"/"),d=i.slice(-l.length)===l;return r||(i=(d?i.slice(0,-l.length):i)+"(?:"+l+"(?=$))?"),i+=o?"$":r&&d?"":"(?="+l+"|$)",f(new RegExp("^"+i,h(n)),t)}function g(e,t,n){return v(t)||(n=t||n,t=[]),n=n||{},e instanceof RegExp?p(e,t):v(e)?l(e,t,n):d(e,t,n)}var v=e("isarray");t.exports=g,t.exports.parse=r,t.exports.compile=o,t.exports.tokensToFunction=s,t.exports.tokensToRegExp=m;var x=new RegExp(["(\\\\.)","([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"),"g")},{isarray:14}],16:[function(e,t,n){!function(){var e=Cache.prototype.addAll,t=navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);if(t)var n=t[1],r=parseInt(t[2]);e&&(!t||"Firefox"===n&&r>=46||"Chrome"===n&&r>=50)||(Cache.prototype.addAll=function(e){function t(e){this.name="NetworkError",this.code=19,this.message=e}var n=this;return t.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return e=e.map(function(e){return e instanceof Request?e:String(e)}),Promise.all(e.map(function(e){"string"==typeof e&&(e=new Request(e));var n=new URL(e.url).protocol;if("http:"!==n&&"https:"!==n)throw new t("Invalid scheme");return fetch(e.clone())}))}).then(function(r){if(r.some(function(e){return!e.ok}))throw new t("Incorrect response status");return Promise.all(r.map(function(t,r){return n.put(e[r],t)}))}).then(function(){})},Cache.prototype.add=function(e){return this.addAll([e])})}()},{}]},{},[13])(13)});


// *** End of auto-included sw-toolbox code. ***



// Runtime cache configuration, using the sw-toolbox library.

toolbox.router.get("^https://fonts.googleapis.com/", toolbox.cacheFirst, {});
toolbox.router.get("^https://fonts.gstatic.com/", toolbox.cacheFirst, {});
toolbox.router.get("^https://unpkg.com/", toolbox.cacheFirst, {});
toolbox.router.get("/pwa.html", toolbox.networkFirst, {});
toolbox.router.get("/", toolbox.networkFirst, {});
toolbox.router.get("/p/*", toolbox.networkFirst, {});
toolbox.router.get("/c/*", toolbox.networkFirst, {});
toolbox.router.get("/img/(.*)", toolbox.fastest, {});
toolbox.router.get("/api/catalog/*", toolbox.networkFirst, {});
toolbox.router.get("/api/*", toolbox.networkFirst, {});
toolbox.router.get("/assets/logo.svg", toolbox.networkFirst, {});
toolbox.router.get("/index.html", toolbox.networkFirst, {});
toolbox.router.get("/assets/*", toolbox.fastest, {});
toolbox.router.get("/assets/ig/(.*)", toolbox.fastest, {});
toolbox.router.get("/dist/(.*)", toolbox.fastest, {});
toolbox.router.get("/*/*", toolbox.networkFirst, {});
toolbox.router.get("/*/*/*", toolbox.networkFirst, {});
toolbox.router.get("/*", toolbox.networkFirst, {});




importScripts("/dist/core-service-worker.js");

