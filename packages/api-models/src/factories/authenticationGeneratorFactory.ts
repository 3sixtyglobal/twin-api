// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@twin.org/core";
import type { IAuthenticationGenerator } from "../models/client/IAuthenticationGenerator.js";

/**
 * Factory for creating implementation of authentication generator types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AuthenticationGeneratorFactory = Factory.createFactory<IAuthenticationGenerator>(
	"authentication-generator"
);
