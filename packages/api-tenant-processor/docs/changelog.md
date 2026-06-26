# Changelog

## [0.9.1-next.2](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.9.1-next.1...api-tenant-processor-v0.9.1-next.2) (2026-06-26)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.9.1-next.1 to 0.9.1-next.2

## [0.9.1-next.1](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.9.1-next.0...api-tenant-processor-v0.9.1-next.1) (2026-06-26)


### Features

* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add livez endpoint ([#57](https://github.com/iotaledger/twin-api/issues/57)) ([ef007db](https://github.com/iotaledger/twin-api/commit/ef007db8201736dd3053211f849ffd03baaa485e))
* add tenant component ([#145](https://github.com/iotaledger/twin-api/issues/145)) ([a440c53](https://github.com/iotaledger/twin-api/commit/a440c53f36618946daee7372fe664f8ace341a08))
* add tests for tenant id handler ([c868e7e](https://github.com/iotaledger/twin-api/commit/c868e7e5831e13df39b8994c40834e51f69fa0b9))
* check tenant id in auth if set ([937ba0c](https://github.com/iotaledger/twin-api/commit/937ba0cd790038556a7b2af251e52b43cb059df4))
* check tenant id in auth if set ([66f7337](https://github.com/iotaledger/twin-api/commit/66f73374d3cf4c1c85ea96ec74bb30712fb84dd7))
* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))
* location encoding ([#79](https://github.com/iotaledger/twin-api/issues/79)) ([c684465](https://github.com/iotaledger/twin-api/commit/c684465f2a871376152472bdecb6aa230b1101a1))
* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))
* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))
* reduce short form tenant id length ([bcda377](https://github.com/iotaledger/twin-api/commit/bcda377daed03b21fd1c6ffe47bad4a45d96602b))
* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))
* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))
* tenant api and scopes ([#75](https://github.com/iotaledger/twin-api/issues/75)) ([c663141](https://github.com/iotaledger/twin-api/commit/c663141091e8974d769f8f9904ecdab009ebd083))
* tenant id in jwt ([#140](https://github.com/iotaledger/twin-api/issues/140)) ([8d37a7b](https://github.com/iotaledger/twin-api/commit/8d37a7b98b45fde53df1e909cffc0869aa758655))
* tenantToken decoder on skipTenant routes + BaseRestClient query-string preservation ([#108](https://github.com/iotaledger/twin-api/issues/108)) ([1435357](https://github.com/iotaledger/twin-api/commit/1435357034b41130fc97238c728265e48f746f1e))
* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))
* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))
* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))


### Bug Fixes

* do not check x-api-key for health resourcr ([#54](https://github.com/iotaledger/twin-api/issues/54)) ([897a747](https://github.com/iotaledger/twin-api/commit/897a747a57ed76ee37035f7ea3d40953df3f5fb0))
* duplicate api keys ([#61](https://github.com/iotaledger/twin-api/issues/61)) ([5519c2d](https://github.com/iotaledger/twin-api/commit/5519c2d077d9b3d4b5fc7d5f073ef67cd000a367))
* ensure publicOrigin is unique ([1aaf7f5](https://github.com/iotaledger/twin-api/commit/1aaf7f518d1e090e25f38ed335f8d1efa3c69197))
* prevent runPerTenant from mutating the active request context ([#152](https://github.com/iotaledger/twin-api/issues/152)) ([6e2c88c](https://github.com/iotaledger/twin-api/commit/6e2c88cfeba046ba71a218e62c90eafafaea2713))
* remove extraneous type ([f85c52c](https://github.com/iotaledger/twin-api/commit/f85c52c55caa3a7a64f6f675842f0ea59289a5d9))
* tenant processor skip auth inversion ([#168](https://github.com/iotaledger/twin-api/issues/168)) ([40fadd3](https://github.com/iotaledger/twin-api/commit/40fadd3bc711da34bfef62986ad83b2fa38114da))
* throw AlreadyExistsError on duplicate tenant id in create() ([#164](https://github.com/iotaledger/twin-api/issues/164)) ([b69f408](https://github.com/iotaledger/twin-api/commit/b69f408fc06a0599723b048fa4a5053305a06b78))
* use base64Url for tenant id short form so it doesn't include slash ([7210771](https://github.com/iotaledger/twin-api/commit/72107718650acd05440ce9d9bf10905e6052281c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.9.1-next.0 to 0.9.1-next.1

## [0.9.0](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.9.0...api-tenant-processor-v0.9.0) (2026-06-24)


### Features

* release to production ([70ee2d5](https://github.com/iotaledger/twin-api/commit/70ee2d56a1dc9537d7c9c154d4cb78a235678a3a))
* release to production ([#195](https://github.com/iotaledger/twin-api/issues/195)) ([a3f5c1f](https://github.com/iotaledger/twin-api/commit/a3f5c1fc35a748762af7efa4f7f95776004d1309))
* release to production ([#197](https://github.com/iotaledger/twin-api/issues/197)) ([f04c156](https://github.com/iotaledger/twin-api/commit/f04c1567f801cde36c5ec8595f9b9369109d9e42))
* release to production ([#201](https://github.com/iotaledger/twin-api/issues/201)) ([e1c46fd](https://github.com/iotaledger/twin-api/commit/e1c46fd02c1f4d44d5393e2f49a24f1e4468f240))

## [0.9.0-next.1](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.9.0-next.0...api-tenant-processor-v0.9.0-next.1) (2026-06-23)


### Features

* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add livez endpoint ([#57](https://github.com/iotaledger/twin-api/issues/57)) ([ef007db](https://github.com/iotaledger/twin-api/commit/ef007db8201736dd3053211f849ffd03baaa485e))
* add tenant component ([#145](https://github.com/iotaledger/twin-api/issues/145)) ([a440c53](https://github.com/iotaledger/twin-api/commit/a440c53f36618946daee7372fe664f8ace341a08))
* add tests for tenant id handler ([c868e7e](https://github.com/iotaledger/twin-api/commit/c868e7e5831e13df39b8994c40834e51f69fa0b9))
* check tenant id in auth if set ([937ba0c](https://github.com/iotaledger/twin-api/commit/937ba0cd790038556a7b2af251e52b43cb059df4))
* check tenant id in auth if set ([66f7337](https://github.com/iotaledger/twin-api/commit/66f73374d3cf4c1c85ea96ec74bb30712fb84dd7))
* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))
* location encoding ([#79](https://github.com/iotaledger/twin-api/issues/79)) ([c684465](https://github.com/iotaledger/twin-api/commit/c684465f2a871376152472bdecb6aa230b1101a1))
* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))
* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))
* reduce short form tenant id length ([bcda377](https://github.com/iotaledger/twin-api/commit/bcda377daed03b21fd1c6ffe47bad4a45d96602b))
* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))
* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))
* tenant api and scopes ([#75](https://github.com/iotaledger/twin-api/issues/75)) ([c663141](https://github.com/iotaledger/twin-api/commit/c663141091e8974d769f8f9904ecdab009ebd083))
* tenant id in jwt ([#140](https://github.com/iotaledger/twin-api/issues/140)) ([8d37a7b](https://github.com/iotaledger/twin-api/commit/8d37a7b98b45fde53df1e909cffc0869aa758655))
* tenantToken decoder on skipTenant routes + BaseRestClient query-string preservation ([#108](https://github.com/iotaledger/twin-api/issues/108)) ([1435357](https://github.com/iotaledger/twin-api/commit/1435357034b41130fc97238c728265e48f746f1e))
* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))
* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))
* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))


### Bug Fixes

* do not check x-api-key for health resourcr ([#54](https://github.com/iotaledger/twin-api/issues/54)) ([897a747](https://github.com/iotaledger/twin-api/commit/897a747a57ed76ee37035f7ea3d40953df3f5fb0))
* duplicate api keys ([#61](https://github.com/iotaledger/twin-api/issues/61)) ([5519c2d](https://github.com/iotaledger/twin-api/commit/5519c2d077d9b3d4b5fc7d5f073ef67cd000a367))
* ensure publicOrigin is unique ([1aaf7f5](https://github.com/iotaledger/twin-api/commit/1aaf7f518d1e090e25f38ed335f8d1efa3c69197))
* prevent runPerTenant from mutating the active request context ([#152](https://github.com/iotaledger/twin-api/issues/152)) ([6e2c88c](https://github.com/iotaledger/twin-api/commit/6e2c88cfeba046ba71a218e62c90eafafaea2713))
* remove extraneous type ([f85c52c](https://github.com/iotaledger/twin-api/commit/f85c52c55caa3a7a64f6f675842f0ea59289a5d9))
* tenant processor skip auth inversion ([#168](https://github.com/iotaledger/twin-api/issues/168)) ([40fadd3](https://github.com/iotaledger/twin-api/commit/40fadd3bc711da34bfef62986ad83b2fa38114da))
* throw AlreadyExistsError on duplicate tenant id in create() ([#164](https://github.com/iotaledger/twin-api/issues/164)) ([b69f408](https://github.com/iotaledger/twin-api/commit/b69f408fc06a0599723b048fa4a5053305a06b78))
* use base64Url for tenant id short form so it doesn't include slash ([7210771](https://github.com/iotaledger/twin-api/commit/72107718650acd05440ce9d9bf10905e6052281c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.9.0-next.0 to 0.9.0-next.1

## [0.0.3-next.53](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.52...api-tenant-processor-v0.0.3-next.53) (2026-06-23)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.52 to 0.0.3-next.53

## [0.0.3-next.52](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.51...api-tenant-processor-v0.0.3-next.52) (2026-06-22)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.51 to 0.0.3-next.52

## [0.0.3-next.51](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.50...api-tenant-processor-v0.0.3-next.51) (2026-06-20)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.50 to 0.0.3-next.51

## [0.0.3-next.50](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.49...api-tenant-processor-v0.0.3-next.50) (2026-06-19)


### Bug Fixes

* ensure publicOrigin is unique ([1aaf7f5](https://github.com/iotaledger/twin-api/commit/1aaf7f518d1e090e25f38ed335f8d1efa3c69197))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.49 to 0.0.3-next.50

## [0.0.3-next.49](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.48...api-tenant-processor-v0.0.3-next.49) (2026-06-19)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.48 to 0.0.3-next.49

## [0.0.3-next.48](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.47...api-tenant-processor-v0.0.3-next.48) (2026-06-19)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.47 to 0.0.3-next.48

## [0.0.3-next.47](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.46...api-tenant-processor-v0.0.3-next.47) (2026-06-18)


### Features

* remove hosting component ([#170](https://github.com/iotaledger/twin-api/issues/170)) ([e78c1e8](https://github.com/iotaledger/twin-api/commit/e78c1e87d2747bf58da02b6b77680708ff681122))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.46 to 0.0.3-next.47

## [0.0.3-next.46](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.45...api-tenant-processor-v0.0.3-next.46) (2026-06-17)


### Bug Fixes

* tenant processor skip auth inversion ([#168](https://github.com/iotaledger/twin-api/issues/168)) ([40fadd3](https://github.com/iotaledger/twin-api/commit/40fadd3bc711da34bfef62986ad83b2fa38114da))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.45 to 0.0.3-next.46

## [0.0.3-next.45](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.44...api-tenant-processor-v0.0.3-next.45) (2026-06-15)


### Bug Fixes

* throw AlreadyExistsError on duplicate tenant id in create() ([#164](https://github.com/iotaledger/twin-api/issues/164)) ([b69f408](https://github.com/iotaledger/twin-api/commit/b69f408fc06a0599723b048fa4a5053305a06b78))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.44 to 0.0.3-next.45

## [0.0.3-next.44](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.43...api-tenant-processor-v0.0.3-next.44) (2026-06-11)


### Features

* organization identifiers ([#158](https://github.com/iotaledger/twin-api/issues/158)) ([ce13244](https://github.com/iotaledger/twin-api/commit/ce13244aaacbf82d9e5f87d905e283b36ad63bbf))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.43 to 0.0.3-next.44

## [0.0.3-next.43](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.42...api-tenant-processor-v0.0.3-next.43) (2026-06-10)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.42 to 0.0.3-next.43

## [0.0.3-next.42](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.41...api-tenant-processor-v0.0.3-next.42) (2026-06-08)


### Bug Fixes

* prevent runPerTenant from mutating the active request context ([#152](https://github.com/iotaledger/twin-api/issues/152)) ([6e2c88c](https://github.com/iotaledger/twin-api/commit/6e2c88cfeba046ba71a218e62c90eafafaea2713))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.41 to 0.0.3-next.42

## [0.0.3-next.41](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.40...api-tenant-processor-v0.0.3-next.41) (2026-06-05)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.40 to 0.0.3-next.41

## [0.0.3-next.40](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.39...api-tenant-processor-v0.0.3-next.40) (2026-06-04)


### Features

* add tenant component ([#145](https://github.com/iotaledger/twin-api/issues/145)) ([a440c53](https://github.com/iotaledger/twin-api/commit/a440c53f36618946daee7372fe664f8ace341a08))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.39 to 0.0.3-next.40

## [0.0.3-next.39](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.38...api-tenant-processor-v0.0.3-next.39) (2026-06-02)


### Features

* tenant id in jwt ([#140](https://github.com/iotaledger/twin-api/issues/140)) ([8d37a7b](https://github.com/iotaledger/twin-api/commit/8d37a7b98b45fde53df1e909cffc0869aa758655))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.38 to 0.0.3-next.39

## [0.0.3-next.38](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.37...api-tenant-processor-v0.0.3-next.38) (2026-05-28)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.37 to 0.0.3-next.38

## [0.0.3-next.37](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.36...api-tenant-processor-v0.0.3-next.37) (2026-05-22)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.36 to 0.0.3-next.37

## [0.0.3-next.36](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.35...api-tenant-processor-v0.0.3-next.36) (2026-05-22)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.35 to 0.0.3-next.36

## [0.0.3-next.35](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.34...api-tenant-processor-v0.0.3-next.35) (2026-05-21)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.34 to 0.0.3-next.35

## [0.0.3-next.34](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.33...api-tenant-processor-v0.0.3-next.34) (2026-05-19)


### Features

* update dependencies ([32b8cd2](https://github.com/iotaledger/twin-api/commit/32b8cd20353119dd1998e293d54063cf4d9ecc29))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.33 to 0.0.3-next.34

## [0.0.3-next.33](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.32...api-tenant-processor-v0.0.3-next.33) (2026-05-11)


### Features

* typescript 6 update ([78d2aa0](https://github.com/iotaledger/twin-api/commit/78d2aa00902f79b61973079b798b87ec05f18a8b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.32 to 0.0.3-next.33

## [0.0.3-next.32](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.31...api-tenant-processor-v0.0.3-next.32) (2026-05-07)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.31 to 0.0.3-next.32

## [0.0.3-next.31](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.30...api-tenant-processor-v0.0.3-next.31) (2026-05-06)


### Features

* update health format ([cfbfbbb](https://github.com/iotaledger/twin-api/commit/cfbfbbb2e9afbd2574ffd2446ad51e4217437951))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.30 to 0.0.3-next.31

## [0.0.3-next.30](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.29...api-tenant-processor-v0.0.3-next.30) (2026-05-05)


### Features

* separate service responsibilities ([#116](https://github.com/iotaledger/twin-api/issues/116)) ([2234648](https://github.com/iotaledger/twin-api/commit/2234648de4a2de5b7356aadde328f40470bc12e3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.29 to 0.0.3-next.30

## [0.0.3-next.29](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.28...api-tenant-processor-v0.0.3-next.29) (2026-05-01)


### Features

* hosting service ([#109](https://github.com/iotaledger/twin-api/issues/109)) ([985bf1f](https://github.com/iotaledger/twin-api/commit/985bf1f5c07b09ecb800df7120bc2422ac7a6d25))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.28 to 0.0.3-next.29

## [0.0.3-next.28](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.27...api-tenant-processor-v0.0.3-next.28) (2026-04-30)


### Features

* tenantToken decoder on skipTenant routes + BaseRestClient query-string preservation ([#108](https://github.com/iotaledger/twin-api/issues/108)) ([1435357](https://github.com/iotaledger/twin-api/commit/1435357034b41130fc97238c728265e48f746f1e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.27 to 0.0.3-next.28

## [0.0.3-next.27](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.26...api-tenant-processor-v0.0.3-next.27) (2026-04-23)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.26 to 0.0.3-next.27

## [0.0.3-next.26](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.25...api-tenant-processor-v0.0.3-next.26) (2026-04-22)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.25 to 0.0.3-next.26

## [0.0.3-next.25](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.24...api-tenant-processor-v0.0.3-next.25) (2026-04-14)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.24 to 0.0.3-next.25

## [0.0.3-next.24](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.23...api-tenant-processor-v0.0.3-next.24) (2026-04-14)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.23 to 0.0.3-next.24

## [0.0.3-next.23](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.22...api-tenant-processor-v0.0.3-next.23) (2026-04-14)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.22 to 0.0.3-next.23

## [0.0.3-next.22](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.21...api-tenant-processor-v0.0.3-next.22) (2026-03-27)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.21 to 0.0.3-next.22

## [0.0.3-next.21](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.20...api-tenant-processor-v0.0.3-next.21) (2026-03-11)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.20 to 0.0.3-next.21

## [0.0.3-next.20](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.19...api-tenant-processor-v0.0.3-next.20) (2026-02-09)


### Features

* location encoding ([#79](https://github.com/iotaledger/twin-api/issues/79)) ([c684465](https://github.com/iotaledger/twin-api/commit/c684465f2a871376152472bdecb6aa230b1101a1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.19 to 0.0.3-next.20

## [0.0.3-next.19](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.18...api-tenant-processor-v0.0.3-next.19) (2026-02-06)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.18 to 0.0.3-next.19

## [0.0.3-next.18](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.17...api-tenant-processor-v0.0.3-next.18) (2026-02-04)


### Features

* tenant api and scopes ([#75](https://github.com/iotaledger/twin-api/issues/75)) ([c663141](https://github.com/iotaledger/twin-api/commit/c663141091e8974d769f8f9904ecdab009ebd083))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.17 to 0.0.3-next.18

## [0.0.3-next.17](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.16...api-tenant-processor-v0.0.3-next.17) (2026-01-26)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.16 to 0.0.3-next.17

## [0.0.3-next.16](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.15...api-tenant-processor-v0.0.3-next.16) (2026-01-26)


### Features

* public base url ([#70](https://github.com/iotaledger/twin-api/issues/70)) ([5b958cd](https://github.com/iotaledger/twin-api/commit/5b958cd91e8a38cdae2835ff5f2356c7e48d37c3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.15 to 0.0.3-next.16

## [0.0.3-next.15](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.14...api-tenant-processor-v0.0.3-next.15) (2026-01-22)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.14 to 0.0.3-next.15

## [0.0.3-next.14](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.13...api-tenant-processor-v0.0.3-next.14) (2026-01-20)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.13 to 0.0.3-next.14

## [0.0.3-next.13](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.12...api-tenant-processor-v0.0.3-next.13) (2026-01-19)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.12 to 0.0.3-next.13

## [0.0.3-next.12](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.11...api-tenant-processor-v0.0.3-next.12) (2026-01-12)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.11 to 0.0.3-next.12

## [0.0.3-next.11](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.10...api-tenant-processor-v0.0.3-next.11) (2026-01-08)


### Bug Fixes

* duplicate api keys ([#61](https://github.com/iotaledger/twin-api/issues/61)) ([5519c2d](https://github.com/iotaledger/twin-api/commit/5519c2d077d9b3d4b5fc7d5f073ef67cd000a367))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.10 to 0.0.3-next.11

## [0.0.3-next.10](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.9...api-tenant-processor-v0.0.3-next.10) (2026-01-05)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.9 to 0.0.3-next.10

## [0.0.3-next.9](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.8...api-tenant-processor-v0.0.3-next.9) (2026-01-05)


### Features

* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add livez endpoint ([#57](https://github.com/iotaledger/twin-api/issues/57)) ([ef007db](https://github.com/iotaledger/twin-api/commit/ef007db8201736dd3053211f849ffd03baaa485e))
* add tests for tenant id handler ([c868e7e](https://github.com/iotaledger/twin-api/commit/c868e7e5831e13df39b8994c40834e51f69fa0b9))
* check tenant id in auth if set ([937ba0c](https://github.com/iotaledger/twin-api/commit/937ba0cd790038556a7b2af251e52b43cb059df4))
* check tenant id in auth if set ([66f7337](https://github.com/iotaledger/twin-api/commit/66f73374d3cf4c1c85ea96ec74bb30712fb84dd7))
* reduce short form tenant id length ([bcda377](https://github.com/iotaledger/twin-api/commit/bcda377daed03b21fd1c6ffe47bad4a45d96602b))


### Bug Fixes

* do not check x-api-key for health resourcr ([#54](https://github.com/iotaledger/twin-api/issues/54)) ([897a747](https://github.com/iotaledger/twin-api/commit/897a747a57ed76ee37035f7ea3d40953df3f5fb0))
* remove extraneous type ([f85c52c](https://github.com/iotaledger/twin-api/commit/f85c52c55caa3a7a64f6f675842f0ea59289a5d9))
* use base64Url for tenant id short form so it doesn't include slash ([7210771](https://github.com/iotaledger/twin-api/commit/72107718650acd05440ce9d9bf10905e6052281c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.8 to 0.0.3-next.9

## [0.0.3-next.8](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.7...api-tenant-processor-v0.0.3-next.8) (2025-12-17)


### Bug Fixes

* do not check x-api-key for health resourcr ([#54](https://github.com/iotaledger/twin-api/issues/54)) ([897a747](https://github.com/iotaledger/twin-api/commit/897a747a57ed76ee37035f7ea3d40953df3f5fb0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.7 to 0.0.3-next.8

## [0.0.3-next.7](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.6...api-tenant-processor-v0.0.3-next.7) (2025-11-26)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.6 to 0.0.3-next.7

## [0.0.3-next.6](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.5...api-tenant-processor-v0.0.3-next.6) (2025-11-20)


### Features

* check tenant id in auth if set ([937ba0c](https://github.com/iotaledger/twin-api/commit/937ba0cd790038556a7b2af251e52b43cb059df4))
* check tenant id in auth if set ([66f7337](https://github.com/iotaledger/twin-api/commit/66f73374d3cf4c1c85ea96ec74bb30712fb84dd7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.5 to 0.0.3-next.6

## [0.0.3-next.5](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.4...api-tenant-processor-v0.0.3-next.5) (2025-11-14)


### Miscellaneous Chores

* **api-tenant-processor:** Synchronize repo versions


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.4 to 0.0.3-next.5

## [0.0.3-next.4](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.3...api-tenant-processor-v0.0.3-next.4) (2025-11-14)


### Features

* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))
* add tests for tenant id handler ([c868e7e](https://github.com/iotaledger/twin-api/commit/c868e7e5831e13df39b8994c40834e51f69fa0b9))
* reduce short form tenant id length ([bcda377](https://github.com/iotaledger/twin-api/commit/bcda377daed03b21fd1c6ffe47bad4a45d96602b))


### Bug Fixes

* remove extraneous type ([f85c52c](https://github.com/iotaledger/twin-api/commit/f85c52c55caa3a7a64f6f675842f0ea59289a5d9))
* use base64Url for tenant id short form so it doesn't include slash ([7210771](https://github.com/iotaledger/twin-api/commit/72107718650acd05440ce9d9bf10905e6052281c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.3 to 0.0.3-next.4

## [0.0.3-next.3](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.2...api-tenant-processor-v0.0.3-next.3) (2025-11-14)


### Features

* add tests for tenant id handler ([c868e7e](https://github.com/iotaledger/twin-api/commit/c868e7e5831e13df39b8994c40834e51f69fa0b9))


### Bug Fixes

* use base64Url for tenant id short form so it doesn't include slash ([7210771](https://github.com/iotaledger/twin-api/commit/72107718650acd05440ce9d9bf10905e6052281c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.2 to 0.0.3-next.3

## [0.0.3-next.2](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.1...api-tenant-processor-v0.0.3-next.2) (2025-11-12)


### Features

* reduce short form tenant id length ([bcda377](https://github.com/iotaledger/twin-api/commit/bcda377daed03b21fd1c6ffe47bad4a45d96602b))


### Bug Fixes

* remove extraneous type ([f85c52c](https://github.com/iotaledger/twin-api/commit/f85c52c55caa3a7a64f6f675842f0ea59289a5d9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.1 to 0.0.3-next.2

## [0.0.3-next.1](https://github.com/iotaledger/twin-api/compare/api-tenant-processor-v0.0.3-next.0...api-tenant-processor-v0.0.3-next.1) (2025-11-10)


### Features

* add context id features ([#42](https://github.com/iotaledger/twin-api/issues/42)) ([0186055](https://github.com/iotaledger/twin-api/commit/0186055c48afde842a4254b4df9ac9249c40fe40))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @twin.org/api-models bumped from 0.0.3-next.0 to 0.0.3-next.1

## Changelog
