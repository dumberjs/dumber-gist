## [0.8.4](https://github.com/dumberjs/dumber-gist/compare/v0.8.3...v0.8.4) (2020-04-22)



## [0.8.3](https://github.com/dumberjs/dumber-gist/compare/v0.8.2...v0.8.3) (2020-04-22)


### Bug Fixes

* fix broken backbone skeleton ([a154ce9](https://github.com/dumberjs/dumber-gist/commit/a154ce938677a8cf6875760e50d7df398b215306))



## [0.8.2](https://github.com/dumberjs/dumber-gist/compare/v0.8.1...v0.8.2) (2020-04-22)


### Bug Fixes

* space key should work on focused button ([9de5c4d](https://github.com/dumberjs/dumber-gist/commit/9de5c4dd1bd7d9975204500e615e1b519ef109a0))
* unset focus when using up/down keys ([89810dd](https://github.com/dumberjs/dumber-gist/commit/89810dd6df30e5d23f2b098c386e360b7cf3b1c1))



## [0.8.1](https://github.com/dumberjs/dumber-gist/compare/v0.8.0...v0.8.1) (2020-04-22)


### Bug Fixes

* bypass keymaster(keydown) + dialog(keyup) timing bug ([69b3cdc](https://github.com/dumberjs/dumber-gist/commit/69b3cdc1c4d1ae2e62ebe4939564b755c10be78e))



# [0.8.0](https://github.com/dumberjs/dumber-gist/compare/v0.7.2...v0.8.0) (2020-04-21)


### Features

* migrate to aurelia-dialog-lite for proper focus trap ([7f6e85e](https://github.com/dumberjs/dumber-gist/commit/7f6e85e17d3adfb63a87503e696dfd32cd6d008f)), closes [#31](https://github.com/dumberjs/dumber-gist/issues/31)



## [0.7.2](https://github.com/dumberjs/dumber-gist/compare/v0.7.1...v0.7.2) (2020-04-18)


### Bug Fixes

* out of sync is from registry.npmjs.cf, not jsdelivr ([f288547](https://github.com/dumberjs/dumber-gist/commit/f288547465ee39b5bbae433727128eafec5d056d))



## [0.7.1](https://github.com/dumberjs/dumber-gist/compare/v0.7.0...v0.7.1) (2020-04-18)



# [0.7.0](https://github.com/dumberjs/dumber-gist/compare/v0.6.3...v0.7.0) (2020-04-18)


### Bug Fixes

* domainSubfix is useless in test mode ([264bd2e](https://github.com/dumberjs/dumber-gist/commit/264bd2ea055fc5a05bbdd7cff76b991196b302cc))
* invalid message when a requested version is not found (npm vs jsdelivr) ([2736f7f](https://github.com/dumberjs/dumber-gist/commit/2736f7f6af86e88fdb819fa12a2a35ec6f5123ea))
* remove readable-stream v2 patch after upgrading dumber ([78593e2](https://github.com/dumberjs/dumber-gist/commit/78593e22e2cb762b23ffb96e383a97c4bff50a9a))
* simplified error handling ([21a29b5](https://github.com/dumberjs/dumber-gist/commit/21a29b5c6c3d252ce37c0d2421d89221e4f03b1e))
* simplify expression ([a0932cd](https://github.com/dumberjs/dumber-gist/commit/a0932cdde7ff9cfa6d9511930632103bd0c1d3a0))
* use of t.rejects for more readable tests ([6e806d1](https://github.com/dumberjs/dumber-gist/commit/6e806d132296473816a91d4949ba5bbf5fe38c0e))


### Features

* unit test for resolver with invalid package and better error handling in npm-http. ([0cc2b8e](https://github.com/dumberjs/dumber-gist/commit/0cc2b8ee5fb19c7ed3700cafad52d2ac2a96814f))



## [0.6.3](https://github.com/dumberjs/dumber-gist/compare/v0.6.2...v0.6.3) (2020-04-14)


### Bug Fixes

* move focus to dialog ([85adf04](https://github.com/dumberjs/dumber-gist/commit/85adf04d8f5dff0ecc9be8c7a50702898c586f74)), closes [#31](https://github.com/dumberjs/dumber-gist/issues/31)
* use ctrl-alt-n in code editor when alt-n does unicode input ([4e7a6de](https://github.com/dumberjs/dumber-gist/commit/4e7a6de3bae5ea6fe98fd203516a7decb77a49f7))



## [0.6.2](https://github.com/dumberjs/dumber-gist/compare/v0.6.1...v0.6.2) (2020-04-12)


### Bug Fixes

* prevent double dialog ([58acaf2](https://github.com/dumberjs/dumber-gist/commit/58acaf2cf1dc130efe45d7706362c89436430c21))



## [0.6.1](https://github.com/dumberjs/dumber-gist/compare/v0.6.0...v0.6.1) (2020-04-11)


### Bug Fixes

* missing insideIframe check ([d29c0d6](https://github.com/dumberjs/dumber-gist/commit/d29c0d63e6b5060c889477af2e06a639507f6339))



# [0.6.0](https://github.com/dumberjs/dumber-gist/compare/v0.5.7...v0.6.0) (2020-04-11)


### Bug Fixes

* prevent dialog over dialog ([4aa9e70](https://github.com/dumberjs/dumber-gist/commit/4aa9e7020c6d8f55abae1355acfb4c0f8462c01c))


### Features

* add option to turn on codemirror vim mode ([d2bdcc6](https://github.com/dumberjs/dumber-gist/commit/d2bdcc64e16c92ea70758ddd32685b5c9034fae4)), closes [#22](https://github.com/dumberjs/dumber-gist/issues/22)



## [0.5.7](https://github.com/dumberjs/dumber-gist/compare/v0.5.6...v0.5.7) (2020-04-05)


### Bug Fixes

* fix tab selection on mobile devices ([c5b16c6](https://github.com/dumberjs/dumber-gist/commit/c5b16c691a4785ae7a830fa9907e56d72e16ef89)), closes [#30](https://github.com/dumberjs/dumber-gist/issues/30)



## [0.5.6](https://github.com/dumberjs/dumber-gist/compare/v0.5.5...v0.5.6) (2020-04-04)


### Bug Fixes

* fix wrongly captured total page count ([0b09b0c](https://github.com/dumberjs/dumber-gist/commit/0b09b0ce31c3d33edc0376001936d9b60989821c))



## [0.5.5](https://github.com/dumberjs/dumber-gist/compare/v0.5.4...v0.5.5) (2020-04-04)


### Bug Fixes

* fetch all pages of user's gists ([398d6ab](https://github.com/dumberjs/dumber-gist/commit/398d6ab7c0357c7686f6d58fa371d245c3aee957)), closes [#28](https://github.com/dumberjs/dumber-gist/issues/28)
* fix outdated fork dialog layout ([b67724b](https://github.com/dumberjs/dumber-gist/commit/b67724bd8bdbc293fca3ec6ebb59f4785187593d))



## [0.5.4](https://github.com/dumberjs/dumber-gist/compare/v0.5.3...v0.5.4) (2020-04-03)


### Bug Fixes

* fix test selection on Firefox ([6fd57d8](https://github.com/dumberjs/dumber-gist/commit/6fd57d849a33b0fe04961c9c087ae231681d6569))



## [0.5.3](https://github.com/dumberjs/dumber-gist/compare/v0.5.2...v0.5.3) (2020-04-03)



## [0.5.2](https://github.com/dumberjs/dumber-gist/compare/v0.5.1...v0.5.2) (2020-03-24)



## [0.5.1](https://github.com/dumberjs/dumber-gist/compare/v0.5.0...v0.5.1) (2020-03-23)



# [0.5.0](https://github.com/dumberjs/dumber-gist/compare/v0.4.2...v0.5.0) (2020-03-18)


### Bug Fixes

* force readable-stream v2 on zero deps to support stream-browserify ([498c688](https://github.com/dumberjs/dumber-gist/commit/498c688aa9320f4885e12795394f609e8d0f3893))


### Features

* support unit tests when using no spa framework ([75fb9ae](https://github.com/dumberjs/dumber-gist/commit/75fb9ae684559cee02fc6c23ed14a68e4b476bbb))



## [0.4.2](https://github.com/dumberjs/dumber-gist/compare/v0.4.1...v0.4.2) (2020-03-17)


### Bug Fixes

* don't reload if didn't switch app/tests ([b490f4e](https://github.com/dumberjs/dumber-gist/commit/b490f4ee0a2aedd7bb8ce3055234fd08f20ea014))



## [0.4.1](https://github.com/dumberjs/dumber-gist/compare/v0.4.0...v0.4.1) (2020-03-17)



# [0.4.0](https://github.com/dumberjs/dumber-gist/compare/v0.3.0...v0.4.0) (2020-03-17)


### Bug Fixes

* fix inferno jasmine and mocha test code ([b02841d](https://github.com/dumberjs/dumber-gist/commit/b02841d1d4987b5affca979e82fe9e3739b65de5))


### Features

* unit tests for svelte ([e8675ef](https://github.com/dumberjs/dumber-gist/commit/e8675efbc07f922183914447086d2537755415c6))



# [0.3.0](https://github.com/dumberjs/dumber-gist/compare/v0.2.3...v0.3.0) (2020-03-17)


### Bug Fixes

* fix ../src resolving ([71e8be1](https://github.com/dumberjs/dumber-gist/commit/71e8be189fe4e906639b56716307f968eca5dd5f))
* force readable-stream v2 to support stream-browserify ([4025149](https://github.com/dumberjs/dumber-gist/commit/40251491be315efdff3eff21ea617872d62c254c))
* typo ([b03310c](https://github.com/dumberjs/dumber-gist/commit/b03310caf0754e48072d9a77f0846735415d301e))


### Features

* add app/tests switch button ([4701ff2](https://github.com/dumberjs/dumber-gist/commit/4701ff2c54776f138cfb2174b6dbe026e0046e5d))
* add backbone framework ([d0da7b9](https://github.com/dumberjs/dumber-gist/commit/d0da7b90c58590f734169c3f782ee31e87851703))
* filter input in gists list ([5733abd](https://github.com/dumberjs/dumber-gist/commit/5733abd74a5fa4c963606bab9085c9cab64c4a43))
* remove enzyme from preact tests ([6980bfe](https://github.com/dumberjs/dumber-gist/commit/6980bfe32227458417799eaca4fdeeeb8b4ed545))
* support manual <link> tag loading compiled css ([3319f16](https://github.com/dumberjs/dumber-gist/commit/3319f16d8675479e78a26f2ebaf0216bab601733))
* unit tests for aurelia 2 ([9ffb27c](https://github.com/dumberjs/dumber-gist/commit/9ffb27c047ee625258fda9115a2526aa97b7bef4))
* unit tests for backbone ([35030d5](https://github.com/dumberjs/dumber-gist/commit/35030d50f4e3a9e12cc119b3613222ffd5b4e15c))
* unit tests for inferno ([67eea1f](https://github.com/dumberjs/dumber-gist/commit/67eea1f41e1009ff5f68a9c3c3f33a6229bae368))
* unit tests for preact ([4c9e7d7](https://github.com/dumberjs/dumber-gist/commit/4c9e7d7de808555870e20ba668340f1c01fa09d9))
* unit tests for react ([416e140](https://github.com/dumberjs/dumber-gist/commit/416e140a2a47780587dbc921ca1365ce8d7aaf9b))
* unit tests for vue ([35d15ed](https://github.com/dumberjs/dumber-gist/commit/35d15ed6a916e6b5cb0ba8b3026ae10f62fcd20b))



## [0.2.3](https://github.com/dumberjs/dumber-gist/compare/v0.2.2...v0.2.3) (2020-03-12)



## [0.2.2](https://github.com/dumberjs/dumber-gist/compare/v0.2.1...v0.2.2) (2020-03-12)



## [0.2.1](https://github.com/dumberjs/dumber-gist/compare/v0.2.0...v0.2.1) (2020-03-12)


### Bug Fixes

* avoid accessing dom after detach ([48fa85c](https://github.com/dumberjs/dumber-gist/commit/48fa85c58d81e869e0dfe98b35255706a2e2abb4))



# 0.2.0 (2020-03-12)


### Bug Fixes

* avoid calling toString on null/undefined ([4e996e3](https://github.com/dumberjs/dumber-gist/commit/4e996e37d633b402ab4cf4a31523097316595d13))
* avoid dnd cross-talk between resize-panel and move-file ([fa58a6f](https://github.com/dumberjs/dumber-gist/commit/fa58a6f5ad48b013336d4110f09c3c9a6a030f79))
* avoid editor to capture d&d events ([6cd1717](https://github.com/dumberjs/dumber-gist/commit/6cd171714bd5296a22e22b993acd446daafcc4fc))
* avoid scroll bar in nav bar in Firefox ([4c2c678](https://github.com/dumberjs/dumber-gist/commit/4c2c678c46d6b6fb50e9f948de2bb13f251fdfc6))
* avoid undefined es namespace for pure au1 ts type def ([cadbd93](https://github.com/dumberjs/dumber-gist/commit/cadbd93035a82d646f30e28f0230fa2fbe738e1e))
* avoid undefined service worker registration ([f6712e7](https://github.com/dumberjs/dumber-gist/commit/f6712e72f3cc5b05dced59dc9a96632d036d2dc2))
* bring back miss-cache event ([fac5287](https://github.com/dumberjs/dumber-gist/commit/fac5287e7d1f3861d9c0f992c4dbd41a641f04e3))
* bypass a chrome issue in service worker ([2731e39](https://github.com/dumberjs/dumber-gist/commit/2731e3980729f36049c67d0c1d186aa8502b7d1e)), closes [#5](https://github.com/dumberjs/dumber-gist/issues/5)
* Can only call WorkerGlobalScope.fetch on instances of WorkerGlobalScope ([84381e2](https://github.com/dumberjs/dumber-gist/commit/84381e277e6b21181072175ea598efbc6c336361))
* cannot use NODE_ENV production to build worker release because it traps NODE_ENV for the bundler running in browser ([a469e4a](https://github.com/dumberjs/dumber-gist/commit/a469e4a71188e3dc6ee9a93781838a93406a763a))
* cleanup currentUrl when reloading app ([da652a7](https://github.com/dumberjs/dumber-gist/commit/da652a7e250167956be6c952c74e0c4b5dd1ebd1))
* cross-origin iframe doesn't support indexeddb, silent the error ([9b67d9f](https://github.com/dumberjs/dumber-gist/commit/9b67d9fabc31a522194178d784067e255c65728c))
* delay open files to fix edge case on Safari ([0f47e3b](https://github.com/dumberjs/dumber-gist/commit/0f47e3bbe57d8b508652c31dc927d12932f20c23)), closes [#9](https://github.com/dumberjs/dumber-gist/issues/9)
* delay scrolling to fix scroll bar position in Firefox and Chrome ([efdd4de](https://github.com/dumberjs/dumber-gist/commit/efdd4de07a3cbb301ca463329854e6724ea4d751))
* don't reuse previous (unregistered) session id ([13b6ecd](https://github.com/dumberjs/dumber-gist/commit/13b6ecdfc7bf7c5b19ab4f63ac5bfc4793693fa8))
* fix 404 cache control header ([e09edd1](https://github.com/dumberjs/dumber-gist/commit/e09edd1197e56bf9d8455fe19c425d3adfeeb581))
* fix access_token reference ([6a532f9](https://github.com/dumberjs/dumber-gist/commit/6a532f9e59962d584615d51acf081616ab5c95a0))
* fix anchor color ([043cf1c](https://github.com/dumberjs/dumber-gist/commit/043cf1c6033e66687a7dc4a5945a54bb89200abd))
* fix app window reload ([a785746](https://github.com/dumberjs/dumber-gist/commit/a785746a9d66e87328419478bd5f36d3fbf14662))
* fix au1 deps finder on scoped npm package ([ab8c436](https://github.com/dumberjs/dumber-gist/commit/ab8c43662d5881f71215a01f9498b6cf9e17b36f)), closes [#26](https://github.com/dumberjs/dumber-gist/issues/26)
* fix broken autoinject decorator in au1 app ([265379e](https://github.com/dumberjs/dumber-gist/commit/265379e3e0df2128809f1d6375a5dbbbb447504b)), closes [#25](https://github.com/dumberjs/dumber-gist/issues/25)
* fix deleting file from github gist ([582163a](https://github.com/dumberjs/dumber-gist/commit/582163afc0c6a53ff8c2c354e49ccc5f56a64d67))
* fix dep on readable-stream v2 ([68c618e](https://github.com/dumberjs/dumber-gist/commit/68c618ee7fa64c0e9377c1754bfcb2d51f834147))
* fix editor tabs click on mobile devs ([924ac3a](https://github.com/dumberjs/dumber-gist/commit/924ac3abb2103c89ebd2a9e32567399d51eab5e7))
* fix empty missed cache warning ([db410da](https://github.com/dumberjs/dumber-gist/commit/db410daeb008374a959b036096890d7fb6e81aea))
* fix host-name file ([70be5cf](https://github.com/dumberjs/dumber-gist/commit/70be5cf7b6500023411c397f2f4284a0c9885996))
* fix invisible warning for outdated browser ([d95f619](https://github.com/dumberjs/dumber-gist/commit/d95f619c64f665e6ab1b8e12fd7f3edb70ebc3fc))
* fix keyboard shortcut on create-file ([4da7625](https://github.com/dumberjs/dumber-gist/commit/4da76255a5e0386e4777503650cb19c7ed04a5f8))
* fix messed up css ([5ee8c55](https://github.com/dumberjs/dumber-gist/commit/5ee8c552ac65cf90b0032d7d227ae49591ac31a9))
* fix minor style error during dnd ([9c6dca6](https://github.com/dumberjs/dumber-gist/commit/9c6dca6d2dc12791f329f20d4a63e570891f77f7))
* fix missed localforage missing result ([74ddd6e](https://github.com/dumberjs/dumber-gist/commit/74ddd6e1f5b08ef5778974af5079538d41f2c38a))
* fix move folder, refactor code editor ([c656ced](https://github.com/dumberjs/dumber-gist/commit/c656ced1c254c98d39430d920c44fe583e269d8a))
* fix panel resizing ([d88ad80](https://github.com/dumberjs/dumber-gist/commit/d88ad80d70f6fd707dde42e3ca352beea3ee9357))
* fix recursive looping at logout ([31a04da](https://github.com/dumberjs/dumber-gist/commit/31a04dae55fd4ca8fd8c85852e93ca908f162c49))
* fix regression on user.load after accessToken becomes async ([8c2c01b](https://github.com/dumberjs/dumber-gist/commit/8c2c01b241498efb38df502b748f5f6118e6495e))
* fix rendering in multiple tabs/windows for this app ([3d50da9](https://github.com/dumberjs/dumber-gist/commit/3d50da9226168e44526f3edd660f49223839743f))
* fix resizer location ([8728d9c](https://github.com/dumberjs/dumber-gist/commit/8728d9c6b8ddbe5e43127c482127f45327943fac))
* fix side-bar resizer location ([150886f](https://github.com/dumberjs/dumber-gist/commit/150886f6adb4095ede75a63a10179b44eaa5f43e))
* fix strange exception on empty sass file ([1c906cf](https://github.com/dumberjs/dumber-gist/commit/1c906cfc58f88c5cf3e74677cbaa0890297d185d))
* fix token sync, update reset cache dialog ([601e8f3](https://github.com/dumberjs/dumber-gist/commit/601e8f389663ffa8621d61ae2038a4ae159d5e1d))
* fix updatePath ([9ca8e79](https://github.com/dumberjs/dumber-gist/commit/9ca8e79cd169c5d38468b2573e6895da3b3f4638))
* fix utf8 check ([523b9fd](https://github.com/dumberjs/dumber-gist/commit/523b9fd5805500ed9cad91190d00423e82c7dfc4))
* fix wrong page title in history ([cc43c4b](https://github.com/dumberjs/dumber-gist/commit/cc43c4b67c939e3879eb34b13ab1ba501906f0d4))
* forward service worker error to app console log ([635c992](https://github.com/dumberjs/dumber-gist/commit/635c992caa1c5b10f21e945c69001157d3f598b7))
* github gist doesn't accept "@" in file name ([40120a5](https://github.com/dumberjs/dumber-gist/commit/40120a55edee045ee6c67cc3587062e53d5d7c92))
* github oauth redirect-uri must include protocol ([934e5ad](https://github.com/dumberjs/dumber-gist/commit/934e5ad4535e4f9c7dcd238e88e84f9d43078cf1))
* ignore unknown action in worker ([6a39d67](https://github.com/dumberjs/dumber-gist/commit/6a39d67335b45980734423f5bdc3d63c15cf71a1))
* inferno/preact use normal ext js/ts for jsx content ([b39e000](https://github.com/dumberjs/dumber-gist/commit/b39e00008d6271d77c1d782df1660fabb6ec63c6))
* localStorage could be unavailable in iframe ([7ddd119](https://github.com/dumberjs/dumber-gist/commit/7ddd119d63cf931b6654b4fa5faa0473612a5769))
* localStorage is not available in worker ([8f91028](https://github.com/dumberjs/dumber-gist/commit/8f910289fe02f5cc912120112468d57dfaf7515a))
* longer cache timeout to cover production latency ([fae64d0](https://github.com/dumberjs/dumber-gist/commit/fae64d08342917ec90d06770ddc5e05eab6d2427))
* missing isPrivate flag ([cb8b831](https://github.com/dumberjs/dumber-gist/commit/cb8b8317a5adf9b8c85474d410cd30d0267c8e6d))
* no newline in gist description as GitHub Gist wants one line ([b6558a0](https://github.com/dumberjs/dumber-gist/commit/b6558a042443f8006b6a6ee47cdd0367100ef84b)), closes [#20](https://github.com/dumberjs/dumber-gist/issues/20)
* partially fix file navigation in mobile devices ([013913e](https://github.com/dumberjs/dumber-gist/commit/013913e066765ec08653b62e2d7fecb7b3d76df4))
* remove null img alt text ([beacc28](https://github.com/dumberjs/dumber-gist/commit/beacc28fd003d8eda14e42ddfc61bfa1b564d876))
* remove unused cache storage too ([1278967](https://github.com/dumberjs/dumber-gist/commit/1278967cfbe44a1d4b9b604210863c20949cb872))
* reset opened files when loading new gist ([1d17e6b](https://github.com/dumberjs/dumber-gist/commit/1d17e6b11d827b4a47d11b703ddbbca87783d52a))
* reset rendered hash after failure ([d538d72](https://github.com/dumberjs/dumber-gist/commit/d538d729965ec371ffe458726fdd439d6233c381))
* show cursor in codemirror on mobile ([c9c0d84](https://github.com/dumberjs/dumber-gist/commit/c9c0d8426f67e6ae7e865ba811a204a4da8abd48)), closes [#6](https://github.com/dumberjs/dumber-gist/issues/6)
* silent localforage error when running in iframe ([5e255db](https://github.com/dumberjs/dumber-gist/commit/5e255db44056967a8ded20f325159c223c62e936))
* snapshot files before rendering to avoid set wrong isRendered flag ([5a7572b](https://github.com/dumberjs/dumber-gist/commit/5a7572bc364cae3afaae6aafefdb7e45e3c4984a))
* still needs to wait for worker-up ([a64453f](https://github.com/dumberjs/dumber-gist/commit/a64453fe3526d74abf5ee9247326ca90ed168181))
* the loader path was wrong ([7386906](https://github.com/dumberjs/dumber-gist/commit/7386906ac36dd463351817bae6429c36f0c71a93))
* turn off css-lint because codemirror use it on scss file ([6a87fb1](https://github.com/dumberjs/dumber-gist/commit/6a87fb1e9fc1d8dd26c8c810b499db7eb017a9c6))
* turn on inertial scrolling on mobile ([77f662f](https://github.com/dumberjs/dumber-gist/commit/77f662fa55de68027d429aa83c85ccd1dbcc91a7))
* turn on jsx for all js/ts files ([ef78902](https://github.com/dumberjs/dumber-gist/commit/ef7890223b15ddccf5a0e5e08b3b312eb5b12566))
* unset selected when filter is empty ([487a577](https://github.com/dumberjs/dumber-gist/commit/487a5777a1acd4789accabf27616f1321f01bc04))
* use typescript compiler on au2 ts files too ([6a69a2e](https://github.com/dumberjs/dumber-gist/commit/6a69a2e4bc7c82fd36bbf706a8a9da850429c5eb))
* **client-app:** properly set isRendered to false when deleting file ([c7c2579](https://github.com/dumberjs/dumber-gist/commit/c7c2579d178463d3fb12761bf619ca01f2617329))


### Features

* "open in dumber gist" retains opened tabs ([b15718a](https://github.com/dumberjs/dumber-gist/commit/b15718abb24f91029b789be6113f04dc95ce151e)), closes [#10](https://github.com/dumberjs/dumber-gist/issues/10)
* a help dialog to list all keyboard shortcuts ([6afd92a](https://github.com/dumberjs/dumber-gist/commit/6afd92a28966897a995aff83fa1c3656091722d2)), closes [#13](https://github.com/dumberjs/dumber-gist/issues/13)
* add a button for action of open-any file ([244e28b](https://github.com/dumberjs/dumber-gist/commit/244e28b3a3e61c6cb1651a862fe1ea2520a30b0b))
* add github user input to open gist dialog ([125d853](https://github.com/dumberjs/dumber-gist/commit/125d85343c6df12bb2567c174b8ecf40bc37e899))
* add short cut cmd-s and cmd-p ([fa0e218](https://github.com/dumberjs/dumber-gist/commit/fa0e21811a3232686c207e0213f306d3284fc342))
* allow create new draft over unsaved draft ([855bbc6](https://github.com/dumberjs/dumber-gist/commit/855bbc66ea9385739e9b523e64e1679327dbabf9))
* app and dumber logs ([99e51b6](https://github.com/dumberjs/dumber-gist/commit/99e51b628fb0f9f0680f2de154f53f1cbf1fe195))
* aurelia/aurelia2/react/vue2 skeletons ([a31e673](https://github.com/dumberjs/dumber-gist/commit/a31e6739d3e4b818636d1a59f7b51ebe7bb53784))
* auto refresh embedded browser ([383423a](https://github.com/dumberjs/dumber-gist/commit/383423a539f8db604fafc4d7e9f9fba0961e136e))
* back/forward and reload ([8e6b6e0](https://github.com/dumberjs/dumber-gist/commit/8e6b6e026c8751b8b800a7947073a4dd11f15b79))
* better cache for dumber, au1 and jsdelivr ([2b44aee](https://github.com/dumberjs/dumber-gist/commit/2b44aeecded54bb46f643e5e1fb97bf86c3aed47))
* better dialogs for saving changes ([9344230](https://github.com/dumberjs/dumber-gist/commit/934423089095f5af11e97078ef8fec3dfbded092))
* better error message for bundling ([b5f2d84](https://github.com/dumberjs/dumber-gist/commit/b5f2d84a43ce647d17e9d0da2187e558c6b3b97f))
* button for reset cache ([c4e8de7](https://github.com/dumberjs/dumber-gist/commit/c4e8de763f54c8ac64d1b651caeb0fa0a496ebbb))
* cache and github-oauth server ([608a1e5](https://github.com/dumberjs/dumber-gist/commit/608a1e5c79e20fbcd9021503ec8b2bd48c86df93))
* cache deps-resolver result for a day ([e720061](https://github.com/dumberjs/dumber-gist/commit/e720061d73d12aa11543760060b8395acc2d5db1)), closes [#12](https://github.com/dumberjs/dumber-gist/issues/12)
* check file content when import ([7f908de](https://github.com/dumberjs/dumber-gist/commit/7f908de9472ac48412ece042f3bf558b34ca20cd))
* clean up service worker on used random host ([df78ed9](https://github.com/dumberjs/dumber-gist/commit/df78ed9a2edf33bd843f272067cdafd45437e151)), closes [#17](https://github.com/dumberjs/dumber-gist/issues/17)
* cleanup short-cuts and forward short-cuts from embedded app to main window ([d87e6e9](https://github.com/dumberjs/dumber-gist/commit/d87e6e9114bcef02f9360107d43cd2a8d2d59e91))
* contextmenu on file ([e106261](https://github.com/dumberjs/dumber-gist/commit/e106261b8c33a99f62dad80e917ab9c37b6f033d))
* copied @stackblitz/turbo-resolver ([51fbbb6](https://github.com/dumberjs/dumber-gist/commit/51fbbb6af7312da98f2586e2aeba905f182867da))
* copy own gist, edit description before creating gist ([18c383f](https://github.com/dumberjs/dumber-gist/commit/18c383f9298940b2a23bb73f81b505efa2fde44e))
* create aggressive cache to bypass jsdelivr ([1495f44](https://github.com/dumberjs/dumber-gist/commit/1495f44328a388b4004b00f259d92b52b23bd1d7))
* ctrl-p for quick open file ([1b8c293](https://github.com/dumberjs/dumber-gist/commit/1b8c2937ef64d69877f18cea854211cfa5a2eb7a))
* display gist info, edit description ([62f42dd](https://github.com/dumberjs/dumber-gist/commit/62f42ddf8d69790dc8ef8ac505b986783b6bbab3))
* display svelte as html file, replace tab with spaces ([ad9d637](https://github.com/dumberjs/dumber-gist/commit/ad9d63795d3bb10a597bb2633eb2b12a07520fb5))
* dnd file moving ([aa1bd74](https://github.com/dumberjs/dumber-gist/commit/aa1bd744c6985517b1c77f503093953c80fa77ce))
* dnd reordering file tabs ([22eacbc](https://github.com/dumberjs/dumber-gist/commit/22eacbc1364b9a2bf9c904e4f5568a316052779d))
* draft button, and open new window button ([c46e757](https://github.com/dumberjs/dumber-gist/commit/c46e75755eabef3ed43a4390b9190e3e077b2533))
* drag&drop files ([50ad95b](https://github.com/dumberjs/dumber-gist/commit/50ad95bab2de13e70011797868ecbcb03f8c1e86))
* dumber session in worker ([e93c84e](https://github.com/dumberjs/dumber-gist/commit/e93c84e7d2d710a93a830742fe583f9d8c367035))
* duplicate small cache locally to improve performance ([5817768](https://github.com/dumberjs/dumber-gist/commit/58177686746cb3b4cb04a2c73c9f9a34552d6a51))
* error pop for github api rate limit ([74a070e](https://github.com/dumberjs/dumber-gist/commit/74a070e881d1002c7853bfe32bf6bfcb1ad88ca8))
* fallback to jsdelivr for other resources like fonts ([dcfb96e](https://github.com/dumberjs/dumber-gist/commit/dcfb96e0dbcf5aa6a3df058bf0f77c0210f0c3b0))
* filter user gists ([9126621](https://github.com/dumberjs/dumber-gist/commit/9126621fca9e582b2e6c0efa70635a384e4d8291))
* finalise basic layout ([17c3741](https://github.com/dumberjs/dumber-gist/commit/17c3741905eceb875b440358a282ad6c4475d241))
* finally got two way communication between worker and app through a mid iframe ([3784b3d](https://github.com/dumberjs/dumber-gist/commit/3784b3de6c1746e5993a877a117a9a1c08ee5c0d))
* focus on first opened file when init ([21b2940](https://github.com/dumberjs/dumber-gist/commit/21b294063a3bf936a9dfd1c1455581f1af0c9154))
* fork gist ([df5d33c](https://github.com/dumberjs/dumber-gist/commit/df5d33c7cd25c3c69b386cdffca4d5c4e03872df))
* github links, ctrl-s shortcut to bundle ([5174417](https://github.com/dumberjs/dumber-gist/commit/5174417d81849fe42a6835eb44bacbe6d5165967))
* inferno and preact skeletons ([707f3c2](https://github.com/dumberjs/dumber-gist/commit/707f3c2b5080d619b314d8c8ab2719f8f5a33122))
* inform user about failed service worker ([bcd993e](https://github.com/dumberjs/dumber-gist/commit/bcd993ea40917f93a59f46bb6647635265454ef0)), closes [#19](https://github.com/dumberjs/dumber-gist/issues/19)
* keep scrolling to bottom for logs ([8f9f068](https://github.com/dumberjs/dumber-gist/commit/8f9f06853ea9684d5ab5ae3a798ff042fe069e82))
* lazy load when in iframe ([6e3a469](https://github.com/dumberjs/dumber-gist/commit/6e3a4696b1d6d08a7cd54a265b2fdb3aec6fe693))
* lazy loading for au2/less/sass/svelte toolings ([a3287e2](https://github.com/dumberjs/dumber-gist/commit/a3287e2c3c2aa178b7ab8cee6808d3bebbda15c0))
* list my gists ([9818665](https://github.com/dumberjs/dumber-gist/commit/98186657efdfd671a76f003f8a90c94be6ccd16f))
* new backend cache ([86fd9fc](https://github.com/dumberjs/dumber-gist/commit/86fd9fce1f93c9c791e3bee37693de5e717373d1))
* normalise confirm and wait ([e362e98](https://github.com/dumberjs/dumber-gist/commit/e362e98f02a50959d10be517036a5ae59d6a0a53))
* open gist ([1db486d](https://github.com/dumberjs/dumber-gist/commit/1db486dba1ddf70367f36f6597035e5df35a812b))
* popup error for invalid action ([21c26c8](https://github.com/dumberjs/dumber-gist/commit/21c26c8ce417fae6a95d225c5e4796d2eb7b01e4))
* proper flash screen ([c994c8b](https://github.com/dumberjs/dumber-gist/commit/c994c8b2ebc4bc332557ccad07b75af8c64bccd5))
* proper window title and history ([62c8fe1](https://github.com/dumberjs/dumber-gist/commit/62c8fe1eb3154ca4757ac19e97c0a2d00d49c106))
* reject binary files ([027fc85](https://github.com/dumberjs/dumber-gist/commit/027fc85b241cf074346a7272a38084496278c76a))
* reset url after loading gist or data ([22285d1](https://github.com/dumberjs/dumber-gist/commit/22285d186121d44b17d8896e167a31edb2c74554))
* save gist, get rid of toastr ([c8e3dc3](https://github.com/dumberjs/dumber-gist/commit/c8e3dc398bc94c7a83fc3263a628556157bef6c3))
* scroll focused tab into view ([dc61ff4](https://github.com/dumberjs/dumber-gist/commit/dc61ff4c70a2638eab16675a15d0c529691c04ff))
* separate local cache and remote cache ([b72db91](https://github.com/dumberjs/dumber-gist/commit/b72db917415fe01c249ba395df8bb09f164ee7ea))
* service worker worked! ([ce95cac](https://github.com/dumberjs/dumber-gist/commit/ce95caca39c325f7556bf8c7c260711efe7bb88c))
* share dumber-gist url and iframe ([de2c777](https://github.com/dumberjs/dumber-gist/commit/de2c7770596cb351fc9dcd33b512f0ec43587c02))
* smooth refresh by retaining old rendering for a short period ([feb79b2](https://github.com/dumberjs/dumber-gist/commit/feb79b21d7908b6a255677740fc921600f50c79e))
* some basic linters for html/css/json ([372e7ca](https://github.com/dumberjs/dumber-gist/commit/372e7cac304ec04673556ec3dda3e9f6c6e27e2c))
* support dblclick on skeleton dialog ([1b67a8a](https://github.com/dumberjs/dumber-gist/commit/1b67a8a769e919e7a9377d17fc235fe7f8e23683)), closes [#18](https://github.com/dumberjs/dumber-gist/issues/18)
* support keyboard navigation in select-skeleton-dialog ([57be4f5](https://github.com/dumberjs/dumber-gist/commit/57be4f586eb751e3697bc50147cc7874fa5d7c46))
* support less transpiler ([7b5b0ea](https://github.com/dumberjs/dumber-gist/commit/7b5b0eafa86b342d83ccd0e88972729999ae7d99))
* support package.json dependencies config ([b76e506](https://github.com/dumberjs/dumber-gist/commit/b76e50634e6654567ba95bb51b682c82b6fd7d21))
* support svelte with sass/less ([ca0ee15](https://github.com/dumberjs/dumber-gist/commit/ca0ee155edcde857b7c5644d88b2e98d7a8fa70d))
* svelte skeleton ([a150fa1](https://github.com/dumberjs/dumber-gist/commit/a150fa18841098f48c33391c141c9f9ef770cc8d))
* switch to babel to support preact and inferno ([c8c00f4](https://github.com/dumberjs/dumber-gist/commit/c8c00f49d18d1e8c5f1a3a4dff9f66744d35eacc))
* track embedded app routes ([792e4e7](https://github.com/dumberjs/dumber-gist/commit/792e4e7860d90eaf1220253e08f6279cd4486d58))
* try open readme file automatically ([c32ef28](https://github.com/dumberjs/dumber-gist/commit/c32ef285fad4cd9737da05a60d865e1a25f5cdff))
* turn on aurelia deps finder ([d7fcba2](https://github.com/dumberjs/dumber-gist/commit/d7fcba28bb2e9354c445d317c8aed07cde303a3d))
* two columns layout for wide dialog ([94c59ae](https://github.com/dumberjs/dumber-gist/commit/94c59aeca1e68b7ada1096dc0d100dbc7e13d2a0))
* use localforage to cache traced results ([cd887e5](https://github.com/dumberjs/dumber-gist/commit/cd887e5efdf225a989d45a2df846c7d0cc786863))
* use sass.js to compile sass/scss files ([fe1ea23](https://github.com/dumberjs/dumber-gist/commit/fe1ea232cdb12d5dffb14b33886eefce8aab098f))
* use typescript compiler on js/ts/jsx/tsx files ([39fee16](https://github.com/dumberjs/dumber-gist/commit/39fee162500e21a52f79685ef26a29b179d99a85))
* validate user input in create and edit dialogs, refactor action dispatching ([f6073ab](https://github.com/dumberjs/dumber-gist/commit/f6073abc22a580d3d08520b946037355b6ca2b33))
* vue app boots again in iframe ([ea88fd9](https://github.com/dumberjs/dumber-gist/commit/ea88fd9e655fe0bcd62da9f334d5842a3e9638c6))
* worker service to hide service worker details ([9577188](https://github.com/dumberjs/dumber-gist/commit/95771886bc0753ad2a1f41692ba283c649191d6d))




