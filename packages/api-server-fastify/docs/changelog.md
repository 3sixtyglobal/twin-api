# Changelog

## [0.9.2-next.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.2-next.0...api-server-fastify-v0.9.2-next.1) (2026-07-28)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* async socket closedown ([e35f628](https://github.com/iotaledger/twin-api/commit/e35f62874c75f6c8dc175bd9713db9c2d062f697))
* auth enhancements ([#93](https://github.com/iotaledger/twin-api/issues/93)) ([921a50c](https://github.com/iotaledger/twin-api/commit/921a50cd89d26e530a6be6174a5a803060fa0eb6))
* decodeURIComponent for query and path params ([ead68a2](https://github.com/iotaledger/twin-api/commit/ead68a257425c10dd912497f7edd473c469ca132))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))
* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))
* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))
* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))
* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))
* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))
* user admin service ([#77](https://github.com/iotaledger/twin-api/issues/77)) ([c8491df](https://github.com/iotaledger/twin-api/commit/c8491df7b07c1f45560c8a78c6adc806d0ececbb))


### Bug Fixes

* change logout and refresh routes from GET to POST ([#111](https://github.com/iotaledger/twin-api/issues/111)) ([cb8b64b](https://github.com/iotaledger/twin-api/commit/cb8b64b6507f9991baa78a663de2e84269695c82))
* error handling make sure primary error takes precedence ([84b61f2](https://github.com/iotaledger/twin-api/commit/84b61f27fe5e4919c0c9f9a1edc8ff46dc45c1f7))
* locales ([1b84d8e](https://github.com/iotaledger/twin-api/commit/1b84d8eb4dbe2302897e184e6389892b7ba12608))
* missing port in server request url ([#71](https://github.com/iotaledger/twin-api/issues/71)) ([21d1bb5](https://github.com/iotaledger/twin-api/commit/21d1bb57e7dac5c737266876b7521130db1df975))
* prevent error body masking 4xx as 500, run pre-processors in context scope ([#102](https://github.com/iotaledger/twin-api/issues/102)) ([5fbe14c](https://github.com/iotaledger/twin-api/commit/5fbe14c98e11e77a30e16704dcb8bfba7705926b))
* resolve local origin context by organization routing param ([#180](https://github.com/iotaledger/twin-api/issues/180)) ([bceb9f1](https://github.com/iotaledger/twin-api/commit/bceb9f1b5b68382b7e2f9743ee7b4ea0e3a33f55))
* socket.io cleanup ([554324c](https://github.com/iotaledger/twin-api/commit/554324c0349a79b6722e32f042fc0a77572b4c9b))
* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/api-models bumped from 0.9.2-next.0 to 0.9.2-next.1
    * @twin.org/api-processors bumped from 0.9.2-next.0 to 0.9.2-next.1

## [0.9.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1...api-server-fastify-v0.9.1) (2026-07-27)


### Features

* release to production ([70ee2d5](https://github.com/iotaledger/twin-api/commit/70ee2d56a1dc9537d7c9c154d4cb78a235678a3a))
* release to production ([#195](https://github.com/iotaledger/twin-api/issues/195)) ([a3f5c1f](https://github.com/iotaledger/twin-api/commit/a3f5c1fc35a748762af7efa4f7f95776004d1309))
* release to production ([#197](https://github.com/iotaledger/twin-api/issues/197)) ([f04c156](https://github.com/iotaledger/twin-api/commit/f04c1567f801cde36c5ec8595f9b9369109d9e42))
* release to production ([#201](https://github.com/iotaledger/twin-api/issues/201)) ([e1c46fd](https://github.com/iotaledger/twin-api/commit/e1c46fd02c1f4d44d5393e2f49a24f1e4468f240))
* release to production ([#224](https://github.com/iotaledger/twin-api/issues/224)) ([dffaf08](https://github.com/iotaledger/twin-api/commit/dffaf082b7dccc6f57a5b7cd20b95d24bb8ec2f3))

## [0.9.1-next.9](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.8...api-server-fastify-v0.9.1-next.9) (2026-07-23)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/api-models bumped from 0.9.1-next.8 to 0.9.1-next.9
    * @twin.org/api-processors bumped from 0.9.1-next.8 to 0.9.1-next.9

## [0.9.1-next.8](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.7...api-server-fastify-v0.9.1-next.8) (2026-07-03)


### Features

* async socket closedown ([e35f628](https://github.com/iotaledger/twin-api/commit/e35f62874c75f6c8dc175bd9713db9c2d062f697))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/api-models bumped from 0.9.1-next.7 to 0.9.1-next.8
    * @twin.org/api-processors bumped from 0.9.1-next.7 to 0.9.1-next.8

## [0.9.1-next.7](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.6...api-server-fastify-v0.9.1-next.7) (2026-07-02)


### Bug Fixes

* socket.io cleanup ([554324c](https://github.com/iotaledger/twin-api/commit/554324c0349a79b6722e32f042fc0a77572b4c9b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/api-models bumped from 0.9.1-next.6 to 0.9.1-next.7
    * @twin.org/api-processors bumped from 0.9.1-next.6 to 0.9.1-next.7

## [0.9.1-next.6](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.5...api-server-fastify-v0.9.1-next.6) (2026-06-30)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/api-models bumped from 0.9.1-next.5 to 0.9.1-next.6
    * @twin.org/api-processors bumped from 0.9.1-next.5 to 0.9.1-next.6

## [0.9.1-next.5](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.4...api-server-fastify-v0.9.1-next.5) (2026-06-30)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/api-models bumped from 0.9.1-next.4 to 0.9.1-next.5
    * @twin.org/api-processors bumped from 0.9.1-next.4 to 0.9.1-next.5

## [0.9.1-next.4](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.3...api-server-fastify-v0.9.1-next.4) (2026-06-30)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/api-models bumped from 0.9.1-next.3 to 0.9.1-next.4
    * @twin.org/api-processors bumped from 0.9.1-next.3 to 0.9.1-next.4

## [0.9.1-next.3](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.2...api-server-fastify-v0.9.1-next.3) (2026-06-29)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/api-models bumped from 0.9.1-next.2 to 0.9.1-next.3
    * @twin.org/api-processors bumped from 0.9.1-next.2 to 0.9.1-next.3

## [0.9.1-next.2](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.1...api-server-fastify-v0.9.1-next.2) (2026-06-26)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/api-models bumped from 0.9.1-next.1 to 0.9.1-next.2
    * @twin.org/api-processors bumped from 0.9.1-next.1 to 0.9.1-next.2

## [0.9.1-next.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.1-next.0...api-server-fastify-v0.9.1-next.1) (2026-06-26)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* auth enhancements ([#93](https://github.com/iotaledger/twin-api/issues/93)) ([921a50c](https://github.com/iotaledger/twin-api/commit/921a50cd89d26e530a6be6174a5a803060fa0eb6))
* decodeURIComponent for query and path params ([ead68a2](https://github.com/iotaledger/twin-api/commit/ead68a257425c10dd912497f7edd473c469ca132))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))
* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))
* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))
* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))
* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))
* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))
* user admin service ([#77](https://github.com/iotaledger/twin-api/issues/77)) ([c8491df](https://github.com/iotaledger/twin-api/commit/c8491df7b07c1f45560c8a78c6adc806d0ececbb))


### Bug Fixes

* change logout and refresh routes from GET to POST ([#111](https://github.com/iotaledger/twin-api/issues/111)) ([cb8b64b](https://github.com/iotaledger/twin-api/commit/cb8b64b6507f9991baa78a663de2e84269695c82))
* error handling make sure primary error takes precedence ([84b61f2](https://github.com/iotaledger/twin-api/commit/84b61f27fe5e4919c0c9f9a1edc8ff46dc45c1f7))
* locales ([1b84d8e](https://github.com/iotaledger/twin-api/commit/1b84d8eb4dbe2302897e184e6389892b7ba12608))
* missing port in server request url ([#71](https://github.com/iotaledger/twin-api/issues/71)) ([21d1bb5](https://github.com/iotaledger/twin-api/commit/21d1bb57e7dac5c737266876b7521130db1df975))
* prevent error body masking 4xx as 500, run pre-processors in context scope ([#102](https://github.com/iotaledger/twin-api/issues/102)) ([5fbe14c](https://github.com/iotaledger/twin-api/commit/5fbe14c98e11e77a30e16704dcb8bfba7705926b))
* resolve local origin context by organization routing param ([#180](https://github.com/iotaledger/twin-api/issues/180)) ([bceb9f1](https://github.com/iotaledger/twin-api/commit/bceb9f1b5b68382b7e2f9743ee7b4ea0e3a33f55))
* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/api-models bumped from 0.9.1-next.0 to 0.9.1-next.1
    * @twin.org/api-processors bumped from 0.9.1-next.0 to 0.9.1-next.1

## [0.9.0](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.0...api-server-fastify-v0.9.0) (2026-06-24)


### Features

* release to production ([70ee2d5](https://github.com/iotaledger/twin-api/commit/70ee2d56a1dc9537d7c9c154d4cb78a235678a3a))
* release to production ([#195](https://github.com/iotaledger/twin-api/issues/195)) ([a3f5c1f](https://github.com/iotaledger/twin-api/commit/a3f5c1fc35a748762af7efa4f7f95776004d1309))
* release to production ([#197](https://github.com/iotaledger/twin-api/issues/197)) ([f04c156](https://github.com/iotaledger/twin-api/commit/f04c1567f801cde36c5ec8595f9b9369109d9e42))
* release to production ([#201](https://github.com/iotaledger/twin-api/issues/201)) ([e1c46fd](https://github.com/iotaledger/twin-api/commit/e1c46fd02c1f4d44d5393e2f49a24f1e4468f240))

## [0.9.0-next.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.9.0-next.0...api-server-fastify-v0.9.0-next.1) (2026-06-23)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* auth enhancements ([#93](https://github.com/iotaledger/twin-api/issues/93)) ([921a50c](https://github.com/iotaledger/twin-api/commit/921a50cd89d26e530a6be6174a5a803060fa0eb6))
* decodeURIComponent for query and path params ([ead68a2](https://github.com/iotaledger/twin-api/commit/ead68a257425c10dd912497f7edd473c469ca132))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))
* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))
* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))
* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))
* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))
* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))
* user admin service ([#77](https://github.com/iotaledger/twin-api/issues/77)) ([c8491df](https://github.com/iotaledger/twin-api/commit/c8491df7b07c1f45560c8a78c6adc806d0ececbb))


### Bug Fixes

* change logout and refresh routes from GET to POST ([#111](https://github.com/iotaledger/twin-api/issues/111)) ([cb8b64b](https://github.com/iotaledger/twin-api/commit/cb8b64b6507f9991baa78a663de2e84269695c82))
* error handling make sure primary error takes precedence ([84b61f2](https://github.com/iotaledger/twin-api/commit/84b61f27fe5e4919c0c9f9a1edc8ff46dc45c1f7))
* locales ([1b84d8e](https://github.com/iotaledger/twin-api/commit/1b84d8eb4dbe2302897e184e6389892b7ba12608))
* missing port in server request url ([#71](https://github.com/iotaledger/twin-api/issues/71)) ([21d1bb5](https://github.com/iotaledger/twin-api/commit/21d1bb57e7dac5c737266876b7521130db1df975))
* prevent error body masking 4xx as 500, run pre-processors in context scope ([#102](https://github.com/iotaledger/twin-api/issues/102)) ([5fbe14c](https://github.com/iotaledger/twin-api/commit/5fbe14c98e11e77a30e16704dcb8bfba7705926b))
* resolve local origin context by organization routing param ([#180](https://github.com/iotaledger/twin-api/issues/180)) ([bceb9f1](https://github.com/iotaledger/twin-api/commit/bceb9f1b5b68382b7e2f9743ee7b4ea0e3a33f55))
* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/api-models bumped from 0.9.0-next.0 to 0.9.0-next.1
    * @twin.org/api-processors bumped from 0.9.0-next.0 to 0.9.0-next.1

## [0.0.3-next.53](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.52...api-server-fastify-v0.0.3-next.53) (2026-06-23)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.52 to 0.0.3-next.53
    * @twin.org/api-models bumped from 0.0.3-next.52 to 0.0.3-next.53
    * @twin.org/api-processors bumped from 0.0.3-next.52 to 0.0.3-next.53

## [0.0.3-next.52](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.51...api-server-fastify-v0.0.3-next.52) (2026-06-22)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.51 to 0.0.3-next.52
    * @twin.org/api-models bumped from 0.0.3-next.51 to 0.0.3-next.52
    * @twin.org/api-processors bumped from 0.0.3-next.51 to 0.0.3-next.52

## [0.0.3-next.51](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.50...api-server-fastify-v0.0.3-next.51) (2026-06-20)


### Bug Fixes

* resolve local origin context by organization routing param ([#180](https://github.com/iotaledger/twin-api/issues/180)) ([bceb9f1](https://github.com/iotaledger/twin-api/commit/bceb9f1b5b68382b7e2f9743ee7b4ea0e3a33f55))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.50 to 0.0.3-next.51
    * @twin.org/api-models bumped from 0.0.3-next.50 to 0.0.3-next.51
    * @twin.org/api-processors bumped from 0.0.3-next.50 to 0.0.3-next.51

## [0.0.3-next.50](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.49...api-server-fastify-v0.0.3-next.50) (2026-06-19)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.49 to 0.0.3-next.50
    * @twin.org/api-models bumped from 0.0.3-next.49 to 0.0.3-next.50
    * @twin.org/api-processors bumped from 0.0.3-next.49 to 0.0.3-next.50

## [0.0.3-next.49](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.48...api-server-fastify-v0.0.3-next.49) (2026-06-19)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.48 to 0.0.3-next.49
    * @twin.org/api-models bumped from 0.0.3-next.48 to 0.0.3-next.49
    * @twin.org/api-processors bumped from 0.0.3-next.48 to 0.0.3-next.49

## [0.0.3-next.48](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.47...api-server-fastify-v0.0.3-next.48) (2026-06-19)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.47 to 0.0.3-next.48
    * @twin.org/api-models bumped from 0.0.3-next.47 to 0.0.3-next.48
    * @twin.org/api-processors bumped from 0.0.3-next.47 to 0.0.3-next.48

## [0.0.3-next.47](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.46...api-server-fastify-v0.0.3-next.47) (2026-06-18)


### Features

* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/api-models bumped from 0.0.3-next.46 to 0.0.3-next.47
    * @twin.org/api-processors bumped from 0.0.3-next.46 to 0.0.3-next.47

## [0.0.3-next.46](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.45...api-server-fastify-v0.0.3-next.46) (2026-06-17)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/api-models bumped from 0.0.3-next.45 to 0.0.3-next.46
    * @twin.org/api-processors bumped from 0.0.3-next.45 to 0.0.3-next.46

## [0.0.3-next.45](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.44...api-server-fastify-v0.0.3-next.45) (2026-06-15)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/api-models bumped from 0.0.3-next.44 to 0.0.3-next.45
    * @twin.org/api-processors bumped from 0.0.3-next.44 to 0.0.3-next.45

## [0.0.3-next.44](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.43...api-server-fastify-v0.0.3-next.44) (2026-06-11)


### Features

* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/api-models bumped from 0.0.3-next.43 to 0.0.3-next.44
    * @twin.org/api-processors bumped from 0.0.3-next.43 to 0.0.3-next.44

## [0.0.3-next.43](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.42...api-server-fastify-v0.0.3-next.43) (2026-06-10)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/api-models bumped from 0.0.3-next.42 to 0.0.3-next.43
    * @twin.org/api-processors bumped from 0.0.3-next.42 to 0.0.3-next.43

## [0.0.3-next.42](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.41...api-server-fastify-v0.0.3-next.42) (2026-06-08)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/api-models bumped from 0.0.3-next.41 to 0.0.3-next.42
    * @twin.org/api-processors bumped from 0.0.3-next.41 to 0.0.3-next.42

## [0.0.3-next.41](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.40...api-server-fastify-v0.0.3-next.41) (2026-06-05)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/api-models bumped from 0.0.3-next.40 to 0.0.3-next.41
    * @twin.org/api-processors bumped from 0.0.3-next.40 to 0.0.3-next.41

## [0.0.3-next.40](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.39...api-server-fastify-v0.0.3-next.40) (2026-06-04)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/api-models bumped from 0.0.3-next.39 to 0.0.3-next.40
    * @twin.org/api-processors bumped from 0.0.3-next.39 to 0.0.3-next.40

## [0.0.3-next.39](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.38...api-server-fastify-v0.0.3-next.39) (2026-06-02)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/api-models bumped from 0.0.3-next.38 to 0.0.3-next.39
    * @twin.org/api-processors bumped from 0.0.3-next.38 to 0.0.3-next.39

## [0.0.3-next.38](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.37...api-server-fastify-v0.0.3-next.38) (2026-05-28)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/api-models bumped from 0.0.3-next.37 to 0.0.3-next.38
    * @twin.org/api-processors bumped from 0.0.3-next.37 to 0.0.3-next.38

## [0.0.3-next.37](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.36...api-server-fastify-v0.0.3-next.37) (2026-05-22)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/api-models bumped from 0.0.3-next.36 to 0.0.3-next.37
    * @twin.org/api-processors bumped from 0.0.3-next.36 to 0.0.3-next.37

## [0.0.3-next.36](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.35...api-server-fastify-v0.0.3-next.36) (2026-05-22)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/api-models bumped from 0.0.3-next.35 to 0.0.3-next.36
    * @twin.org/api-processors bumped from 0.0.3-next.35 to 0.0.3-next.36

## [0.0.3-next.35](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.34...api-server-fastify-v0.0.3-next.35) (2026-05-21)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/api-models bumped from 0.0.3-next.34 to 0.0.3-next.35
    * @twin.org/api-processors bumped from 0.0.3-next.34 to 0.0.3-next.35

## [0.0.3-next.34](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.33...api-server-fastify-v0.0.3-next.34) (2026-05-19)


### Features

* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/api-models bumped from 0.0.3-next.33 to 0.0.3-next.34
    * @twin.org/api-processors bumped from 0.0.3-next.33 to 0.0.3-next.34

## [0.0.3-next.33](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.32...api-server-fastify-v0.0.3-next.33) (2026-05-11)


### Features

* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/api-models bumped from 0.0.3-next.32 to 0.0.3-next.33
    * @twin.org/api-processors bumped from 0.0.3-next.32 to 0.0.3-next.33

## [0.0.3-next.32](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.31...api-server-fastify-v0.0.3-next.32) (2026-05-07)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/api-models bumped from 0.0.3-next.31 to 0.0.3-next.32
    * @twin.org/api-processors bumped from 0.0.3-next.31 to 0.0.3-next.32

## [0.0.3-next.31](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.30...api-server-fastify-v0.0.3-next.31) (2026-05-06)


### Features

* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/api-models bumped from 0.0.3-next.30 to 0.0.3-next.31
    * @twin.org/api-processors bumped from 0.0.3-next.30 to 0.0.3-next.31

## [0.0.3-next.30](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.29...api-server-fastify-v0.0.3-next.30) (2026-05-05)


### Features

* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/api-models bumped from 0.0.3-next.29 to 0.0.3-next.30
    * @twin.org/api-processors bumped from 0.0.3-next.29 to 0.0.3-next.30

## [0.0.3-next.29](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.28...api-server-fastify-v0.0.3-next.29) (2026-05-01)


### Features

* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/api-models bumped from 0.0.3-next.28 to 0.0.3-next.29
    * @twin.org/api-processors bumped from 0.0.3-next.28 to 0.0.3-next.29

## [0.0.3-next.28](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.27...api-server-fastify-v0.0.3-next.28) (2026-04-30)


### Bug Fixes

* change logout and refresh routes from GET to POST ([#111](https://github.com/iotaledger/twin-api/issues/111)) ([cb8b64b](https://github.com/iotaledger/twin-api/commit/cb8b64b6507f9991baa78a663de2e84269695c82))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/api-models bumped from 0.0.3-next.27 to 0.0.3-next.28
    * @twin.org/api-processors bumped from 0.0.3-next.27 to 0.0.3-next.28

## [0.0.3-next.27](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.26...api-server-fastify-v0.0.3-next.27) (2026-04-23)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/api-models bumped from 0.0.3-next.26 to 0.0.3-next.27
    * @twin.org/api-processors bumped from 0.0.3-next.26 to 0.0.3-next.27

## [0.0.3-next.26](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.25...api-server-fastify-v0.0.3-next.26) (2026-04-22)


### Bug Fixes

* prevent error body masking 4xx as 500, run pre-processors in context scope ([#102](https://github.com/iotaledger/twin-api/issues/102)) ([5fbe14c](https://github.com/iotaledger/twin-api/commit/5fbe14c98e11e77a30e16704dcb8bfba7705926b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/api-models bumped from 0.0.3-next.25 to 0.0.3-next.26
    * @twin.org/api-processors bumped from 0.0.3-next.25 to 0.0.3-next.26

## [0.0.3-next.25](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.24...api-server-fastify-v0.0.3-next.25) (2026-04-14)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/api-models bumped from 0.0.3-next.24 to 0.0.3-next.25
    * @twin.org/api-processors bumped from 0.0.3-next.24 to 0.0.3-next.25

## [0.0.3-next.24](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.23...api-server-fastify-v0.0.3-next.24) (2026-04-14)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/api-models bumped from 0.0.3-next.23 to 0.0.3-next.24
    * @twin.org/api-processors bumped from 0.0.3-next.23 to 0.0.3-next.24

## [0.0.3-next.23](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.22...api-server-fastify-v0.0.3-next.23) (2026-04-14)


### Features

* auth enhancements ([#93](https://github.com/iotaledger/twin-api/issues/93)) ([921a50c](https://github.com/iotaledger/twin-api/commit/921a50cd89d26e530a6be6174a5a803060fa0eb6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/api-models bumped from 0.0.3-next.22 to 0.0.3-next.23
    * @twin.org/api-processors bumped from 0.0.3-next.22 to 0.0.3-next.23

## [0.0.3-next.22](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.21...api-server-fastify-v0.0.3-next.22) (2026-03-27)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/api-models bumped from 0.0.3-next.21 to 0.0.3-next.22
    * @twin.org/api-processors bumped from 0.0.3-next.21 to 0.0.3-next.22

## [0.0.3-next.21](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.20...api-server-fastify-v0.0.3-next.21) (2026-03-11)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/api-models bumped from 0.0.3-next.20 to 0.0.3-next.21
    * @twin.org/api-processors bumped from 0.0.3-next.20 to 0.0.3-next.21

## [0.0.3-next.20](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.19...api-server-fastify-v0.0.3-next.20) (2026-02-09)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/api-models bumped from 0.0.3-next.19 to 0.0.3-next.20
    * @twin.org/api-processors bumped from 0.0.3-next.19 to 0.0.3-next.20

## [0.0.3-next.19](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.18...api-server-fastify-v0.0.3-next.19) (2026-02-06)


### Features

* user admin service ([#77](https://github.com/iotaledger/twin-api/issues/77)) ([c8491df](https://github.com/iotaledger/twin-api/commit/c8491df7b07c1f45560c8a78c6adc806d0ececbb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/api-models bumped from 0.0.3-next.18 to 0.0.3-next.19
    * @twin.org/api-processors bumped from 0.0.3-next.18 to 0.0.3-next.19

## [0.0.3-next.18](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.17...api-server-fastify-v0.0.3-next.18) (2026-02-04)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/api-models bumped from 0.0.3-next.17 to 0.0.3-next.18
    * @twin.org/api-processors bumped from 0.0.3-next.17 to 0.0.3-next.18

## [0.0.3-next.17](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.16...api-server-fastify-v0.0.3-next.17) (2026-01-26)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/api-models bumped from 0.0.3-next.16 to 0.0.3-next.17
    * @twin.org/api-processors bumped from 0.0.3-next.16 to 0.0.3-next.17

## [0.0.3-next.16](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.15...api-server-fastify-v0.0.3-next.16) (2026-01-26)


### Features

* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/api-models bumped from 0.0.3-next.15 to 0.0.3-next.16
    * @twin.org/api-processors bumped from 0.0.3-next.15 to 0.0.3-next.16

## [0.0.3-next.15](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.14...api-server-fastify-v0.0.3-next.15) (2026-01-22)


### Bug Fixes

* missing port in server request url ([#71](https://github.com/iotaledger/twin-api/issues/71)) ([21d1bb5](https://github.com/iotaledger/twin-api/commit/21d1bb57e7dac5c737266876b7521130db1df975))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/api-models bumped from 0.0.3-next.14 to 0.0.3-next.15
    * @twin.org/api-processors bumped from 0.0.3-next.14 to 0.0.3-next.15

## [0.0.3-next.14](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.13...api-server-fastify-v0.0.3-next.14) (2026-01-20)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/api-models bumped from 0.0.3-next.13 to 0.0.3-next.14
    * @twin.org/api-processors bumped from 0.0.3-next.13 to 0.0.3-next.14

## [0.0.3-next.13](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.12...api-server-fastify-v0.0.3-next.13) (2026-01-19)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/api-models bumped from 0.0.3-next.12 to 0.0.3-next.13
    * @twin.org/api-processors bumped from 0.0.3-next.12 to 0.0.3-next.13

## [0.0.3-next.12](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.11...api-server-fastify-v0.0.3-next.12) (2026-01-12)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/api-models bumped from 0.0.3-next.11 to 0.0.3-next.12
    * @twin.org/api-processors bumped from 0.0.3-next.11 to 0.0.3-next.12

## [0.0.3-next.11](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.10...api-server-fastify-v0.0.3-next.11) (2026-01-08)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/api-models bumped from 0.0.3-next.10 to 0.0.3-next.11
    * @twin.org/api-processors bumped from 0.0.3-next.10 to 0.0.3-next.11

## [0.0.3-next.10](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.9...api-server-fastify-v0.0.3-next.10) (2026-01-05)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/api-models bumped from 0.0.3-next.9 to 0.0.3-next.10
    * @twin.org/api-processors bumped from 0.0.3-next.9 to 0.0.3-next.10

## [0.0.3-next.9](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.8...api-server-fastify-v0.0.3-next.9) (2026-01-05)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* decodeURIComponent for query and path params ([ead68a2](https://github.com/iotaledger/twin-api/commit/ead68a257425c10dd912497f7edd473c469ca132))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Bug Fixes

* error handling make sure primary error takes precedence ([84b61f2](https://github.com/iotaledger/twin-api/commit/84b61f27fe5e4919c0c9f9a1edc8ff46dc45c1f7))
* locales ([1b84d8e](https://github.com/iotaledger/twin-api/commit/1b84d8eb4dbe2302897e184e6389892b7ba12608))
* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/api-models bumped from 0.0.3-next.8 to 0.0.3-next.9
    * @twin.org/api-processors bumped from 0.0.3-next.8 to 0.0.3-next.9

## [0.0.3-next.8](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.7...api-server-fastify-v0.0.3-next.8) (2025-12-17)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/api-models bumped from 0.0.3-next.7 to 0.0.3-next.8
    * @twin.org/api-processors bumped from 0.0.3-next.7 to 0.0.3-next.8

## [0.0.3-next.7](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.6...api-server-fastify-v0.0.3-next.7) (2025-11-26)


### Bug Fixes

* error handling make sure primary error takes precedence ([84b61f2](https://github.com/iotaledger/twin-api/commit/84b61f27fe5e4919c0c9f9a1edc8ff46dc45c1f7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/api-models bumped from 0.0.3-next.6 to 0.0.3-next.7
    * @twin.org/api-processors bumped from 0.0.3-next.6 to 0.0.3-next.7

## [0.0.3-next.6](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.5...api-server-fastify-v0.0.3-next.6) (2025-11-20)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/api-models bumped from 0.0.3-next.5 to 0.0.3-next.6
    * @twin.org/api-processors bumped from 0.0.3-next.5 to 0.0.3-next.6

## [0.0.3-next.5](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.4...api-server-fastify-v0.0.3-next.5) (2025-11-14)


### Features

* decodeURIComponent for query and path params ([ead68a2](https://github.com/iotaledger/twin-api/commit/ead68a257425c10dd912497f7edd473c469ca132))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/api-models bumped from 0.0.3-next.4 to 0.0.3-next.5
    * @twin.org/api-processors bumped from 0.0.3-next.4 to 0.0.3-next.5

## [0.0.3-next.4](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.3...api-server-fastify-v0.0.3-next.4) (2025-11-14)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Bug Fixes

* locales ([1b84d8e](https://github.com/iotaledger/twin-api/commit/1b84d8eb4dbe2302897e184e6389892b7ba12608))
* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/api-models bumped from 0.0.3-next.3 to 0.0.3-next.4
    * @twin.org/api-processors bumped from 0.0.3-next.3 to 0.0.3-next.4

## [0.0.3-next.3](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.2...api-server-fastify-v0.0.3-next.3) (2025-11-14)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/api-models bumped from 0.0.3-next.2 to 0.0.3-next.3
    * @twin.org/api-processors bumped from 0.0.3-next.2 to 0.0.3-next.3

## [0.0.3-next.2](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.1...api-server-fastify-v0.0.3-next.2) (2025-11-12)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/api-models bumped from 0.0.3-next.1 to 0.0.3-next.2
    * @twin.org/api-processors bumped from 0.0.3-next.1 to 0.0.3-next.2

## [0.0.3-next.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.3-next.0...api-server-fastify-v0.0.3-next.1) (2025-11-10)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))
* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))
* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))
* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Bug Fixes

* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/api-models bumped from 0.0.3-next.0 to 0.0.3-next.1
    * @twin.org/api-processors bumped from 0.0.3-next.0 to 0.0.3-next.1

## [0.0.2-next.13](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.12...api-server-fastify-v0.0.2-next.13) (2025-10-09)


### Bug Fixes

* use correct format for log messaging ([6b62a18](https://github.com/iotaledger/twin-api/commit/6b62a185e1da1150bb1e4331337e2799294b83c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.12 to 0.0.2-next.13
    * @twin.org/api-models bumped from 0.0.2-next.12 to 0.0.2-next.13
    * @twin.org/api-processors bumped from 0.0.2-next.12 to 0.0.2-next.13

## [0.0.2-next.12](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.11...api-server-fastify-v0.0.2-next.12) (2025-10-09)


### Features

* add validate-locales ([cdba610](https://github.com/iotaledger/twin-api/commit/cdba610a0acb5022d2e3ce729732e6646a297e5e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.11 to 0.0.2-next.12
    * @twin.org/api-models bumped from 0.0.2-next.11 to 0.0.2-next.12
    * @twin.org/api-processors bumped from 0.0.2-next.11 to 0.0.2-next.12

## [0.0.2-next.11](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.10...api-server-fastify-v0.0.2-next.11) (2025-09-29)


### Features

* update IComponent signatures ([915ce37](https://github.com/iotaledger/twin-api/commit/915ce37712326ab4aa6869c350eabaa4622e8430))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.10 to 0.0.2-next.11
    * @twin.org/api-models bumped from 0.0.2-next.10 to 0.0.2-next.11
    * @twin.org/api-processors bumped from 0.0.2-next.10 to 0.0.2-next.11

## [0.0.2-next.10](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.9...api-server-fastify-v0.0.2-next.10) (2025-09-23)


### Features

* add authentication generators and process features option ([a67edf1](https://github.com/iotaledger/twin-api/commit/a67edf1df212bd8ab94a40cddf5338551155696f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.9 to 0.0.2-next.10
    * @twin.org/api-models bumped from 0.0.2-next.9 to 0.0.2-next.10
    * @twin.org/api-processors bumped from 0.0.2-next.9 to 0.0.2-next.10

## [0.0.2-next.9](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.8...api-server-fastify-v0.0.2-next.9) (2025-08-29)


### Features

* eslint migration to flat config ([0dd5820](https://github.com/iotaledger/twin-api/commit/0dd5820e3af97350fd08b8d226f4a6c1a9246805))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.8 to 0.0.2-next.9
    * @twin.org/api-models bumped from 0.0.2-next.8 to 0.0.2-next.9
    * @twin.org/api-processors bumped from 0.0.2-next.8 to 0.0.2-next.9

## [0.0.2-next.8](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.7...api-server-fastify-v0.0.2-next.8) (2025-08-21)


### Features

* add root, favicon routes ([71da1c3](https://github.com/iotaledger/twin-api/commit/71da1c3a93c349588aff7084d1d8d6a29a277da8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.7 to 0.0.2-next.8
    * @twin.org/api-models bumped from 0.0.2-next.7 to 0.0.2-next.8
    * @twin.org/api-processors bumped from 0.0.2-next.7 to 0.0.2-next.8

## [0.0.2-next.7](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.6...api-server-fastify-v0.0.2-next.7) (2025-08-20)


### Features

* logging naming consistency ([a4a6ef2](https://github.com/iotaledger/twin-api/commit/a4a6ef2de5049045589eb78b177ff62e744bde9d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.6 to 0.0.2-next.7
    * @twin.org/api-models bumped from 0.0.2-next.6 to 0.0.2-next.7
    * @twin.org/api-processors bumped from 0.0.2-next.6 to 0.0.2-next.7

## [0.0.2-next.6](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.5...api-server-fastify-v0.0.2-next.6) (2025-08-19)


### Features

* update framework core ([d8eebf2](https://github.com/iotaledger/twin-api/commit/d8eebf267fa2a0abaa84e58590496e9d20490cfa))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.5 to 0.0.2-next.6
    * @twin.org/api-models bumped from 0.0.2-next.5 to 0.0.2-next.6
    * @twin.org/api-processors bumped from 0.0.2-next.5 to 0.0.2-next.6

## [0.0.2-next.5](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.4...api-server-fastify-v0.0.2-next.5) (2025-07-25)


### Features

* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))
* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))
* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.4 to 0.0.2-next.5
    * @twin.org/api-models bumped from 0.0.2-next.4 to 0.0.2-next.5
    * @twin.org/api-processors bumped from 0.0.2-next.4 to 0.0.2-next.5

## [0.0.2-next.4](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.3...api-server-fastify-v0.0.2-next.4) (2025-07-25)


### Features

* add logging component type to request contexts ([210de1b](https://github.com/iotaledger/twin-api/commit/210de1b9e1c91079b59a2b90ddd57569668d647d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.3 to 0.0.2-next.4
    * @twin.org/api-models bumped from 0.0.2-next.3 to 0.0.2-next.4
    * @twin.org/api-processors bumped from 0.0.2-next.3 to 0.0.2-next.4

## [0.0.2-next.3](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.2...api-server-fastify-v0.0.2-next.3) (2025-07-24)


### Features

* add socket id, connect and disconnect ([20b0d0e](https://github.com/iotaledger/twin-api/commit/20b0d0ec279cab46141fee09de2c4a7087cdce16))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.2 to 0.0.2-next.3
    * @twin.org/api-models bumped from 0.0.2-next.2 to 0.0.2-next.3
    * @twin.org/api-processors bumped from 0.0.2-next.2 to 0.0.2-next.3

## [0.0.2-next.2](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.1...api-server-fastify-v0.0.2-next.2) (2025-07-17)


### Features

* improve socket route logging ([b8d9519](https://github.com/iotaledger/twin-api/commit/b8d95199f838ac6ba9f45c30ef7c4e613201ff53))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.1 to 0.0.2-next.2
    * @twin.org/api-models bumped from 0.0.2-next.1 to 0.0.2-next.2
    * @twin.org/api-processors bumped from 0.0.2-next.1 to 0.0.2-next.2

## [0.0.2-next.1](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.2-next.0...api-server-fastify-v0.0.2-next.1) (2025-07-08)


### Features

* add json-ld mime type processor and auth admin component ([8861791](https://github.com/iotaledger/twin-api/commit/88617916e23bfbca023dbae1976fe421983a02ff))
* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))
* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-core bumped from 0.0.2-next.0 to 0.0.2-next.1
    * @twin.org/api-models bumped from 0.0.2-next.0 to 0.0.2-next.1
    * @twin.org/api-processors bumped from 0.0.2-next.0 to 0.0.2-next.1

## 0.0.1 (2025-07-03)


### Features

* release to production ([70ee2d5](https://github.com/iotaledger/twin-api/commit/70ee2d56a1dc9537d7c9c154d4cb78a235678a3a))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from ^0.0.0 to ^0.0.1
    * @twin.org/api-core bumped from ^0.0.0 to ^0.0.1
  * devDependencies
    * @twin.org/api-processors bumped from ^0.0.0 to ^0.0.1

## [0.0.1-next.36](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.1-next.35...api-server-fastify-v0.0.1-next.36) (2025-06-17)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.1-next.35 to 0.0.1-next.36
    * @twin.org/api-core bumped from 0.0.1-next.35 to 0.0.1-next.36
  * devDependencies
    * @twin.org/api-processors bumped from 0.0.1-next.35 to 0.0.1-next.36

## [0.0.1-next.35](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.1-next.34...api-server-fastify-v0.0.1-next.35) (2025-06-11)


### Features

* update dependencies ([1171dc4](https://github.com/iotaledger/twin-api/commit/1171dc416a9481737f6a640e3cf30145768f37e9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.1-next.34 to 0.0.1-next.35
    * @twin.org/api-core bumped from 0.0.1-next.34 to 0.0.1-next.35
  * devDependencies
    * @twin.org/api-processors bumped from 0.0.1-next.34 to 0.0.1-next.35

## [0.0.1-next.34](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.1-next.33...api-server-fastify-v0.0.1-next.34) (2025-05-27)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.1-next.33 to 0.0.1-next.34
    * @twin.org/api-core bumped from 0.0.1-next.33 to 0.0.1-next.34
  * devDependencies
    * @twin.org/api-processors bumped from 0.0.1-next.33 to 0.0.1-next.34

## [0.0.1-next.33](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.1-next.32...api-server-fastify-v0.0.1-next.33) (2025-04-17)


### Features

* use shared store mechanism ([#19](https://github.com/iotaledger/twin-api/issues/19)) ([32116df](https://github.com/iotaledger/twin-api/commit/32116df3b4380a30137f5056f242a5c99afa2df9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.1-next.32 to 0.0.1-next.33
    * @twin.org/api-core bumped from 0.0.1-next.32 to 0.0.1-next.33
  * devDependencies
    * @twin.org/api-processors bumped from 0.0.1-next.32 to 0.0.1-next.33

## [0.0.1-next.32](https://github.com/iotaledger/twin-api/compare/api-server-fastify-v0.0.1-next.31...api-server-fastify-v0.0.1-next.32) (2025-03-28)


### Miscellaneous Chores

* **api-server-fastify:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.1-next.31 to 0.0.1-next.32
    * @twin.org/api-core bumped from 0.0.1-next.31 to 0.0.1-next.32
  * devDependencies
    * @twin.org/api-processors bumped from next to 0.0.1-next.32

## v0.0.1-next.31

- Initial Release
