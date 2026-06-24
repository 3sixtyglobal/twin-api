// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ILoggingProcessorConfig } from "./ILoggingProcessorConfig.js";

/**
 * Options for the LoggingProcessor constructor.
 */
export interface ILoggingProcessorConstructorOptions {
	/**
	 * The type for the logging component.
	 */
	loggingComponentType?: string;

	/**
	 * The configuration for the logging processor.
	 */
	config?: ILoggingProcessorConfig;
}
