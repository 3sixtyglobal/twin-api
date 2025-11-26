// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AlreadyExistsError,
	BaseError,
	ConflictError,
	GuardError,
	type IError,
	NotFoundError,
	NotImplementedError,
	UnauthorizedError,
	UnprocessableError,
	ValidationError
} from "@twin.org/core";
import { HeaderTypes, HttpStatusCode, MimeTypes } from "@twin.org/web";
import type { IHttpResponse } from "../models/protocol/IHttpResponse.js";

/**
 * Class to help with processing http errors.
 */
export class HttpErrorHelper {
	/**
	 * Process the errors from the routes.
	 * @param err The error to process.
	 * @param includeStack Should the stack be included in the error.
	 * @returns The status code and additional error data.
	 */
	public static processError(
		err: unknown,
		includeStack?: boolean
	): {
		error: IError;
		httpStatusCode: HttpStatusCode;
	} {
		const error: BaseError = BaseError.fromError(err);

		// If the error or any of its sub errors are of the specific
		// types then set the http response code accordingly
		const flattened = BaseError.flatten(error);

		let httpStatusCode: HttpStatusCode = HttpStatusCode.internalServerError;

		const errorTypeMap: { [id: string]: HttpStatusCode } = {
			[GuardError.CLASS_NAME]: HttpStatusCode.badRequest,
			[ValidationError.CLASS_NAME]: HttpStatusCode.badRequest,
			[ConflictError.CLASS_NAME]: HttpStatusCode.conflict,
			[AlreadyExistsError.CLASS_NAME]: HttpStatusCode.conflict,
			[NotFoundError.CLASS_NAME]: HttpStatusCode.notFound,
			[UnauthorizedError.CLASS_NAME]: HttpStatusCode.unauthorized,
			[NotImplementedError.CLASS_NAME]: HttpStatusCode.forbidden,
			[UnprocessableError.CLASS_NAME]: HttpStatusCode.unprocessableEntity
		};

		// First check the primary error, as we don't want to override that with a sub error
		if (flattened.length > 0) {
			const primaryError = flattened[0];
			if (errorTypeMap[primaryError.name]) {
				httpStatusCode = errorTypeMap[primaryError.name];
			}

			// The primary error is still internal server error, check the sub errors
			if (httpStatusCode === HttpStatusCode.internalServerError) {
				for (const className in errorTypeMap) {
					if (flattened.some(e => BaseError.isErrorName(e, className))) {
						httpStatusCode = errorTypeMap[className];
						break;
					}
				}
			}
		}

		const returnError = error.toJsonObject(includeStack);

		return {
			error: returnError,
			httpStatusCode
		};
	}

	/**
	 * Build an error response.
	 * @param response The response to build the error into.
	 * @param error The error to build the response for.
	 * @param statusCode The status code to use for the error.
	 */
	public static buildResponse(
		response: IHttpResponse,
		error: IError,
		statusCode: HttpStatusCode
	): void {
		response.headers ??= {};
		response.headers[HeaderTypes.ContentType] = `${MimeTypes.Json}; charset=utf-8`;
		response.body = error;
		response.statusCode = statusCode;
	}
}
