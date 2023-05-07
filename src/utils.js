export const formatResolve = ( {
	status = false,
	data = null,
	errorMessageResponse = null,
	errorMessage = null
} ) => {
	if ( !status ) {
		console.log( errorMessageResponse )
	}
	return {
		status,
		data,
		error: !status,
		errorMessageResponse,
		errorMessage
	}
}