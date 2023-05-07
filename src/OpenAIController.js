import config from 'config'
import { Configuration, OpenAIApi } from 'openai'
import { formatResolve } from './utils.js'

class OpenAIControllerClass {
	
	constructor( token ) {
		const configuration = new Configuration( {
			apiKey: token
		} )
		this.openai         = new OpenAIApi( configuration )
		this.chatModel      = 'gpt-3.5-turbo' //'gpt-4'
		this.audioModel     = 'whisper-1'
		this.roles          = {
			SYSTEM: 'system',
			USER: 'user',
			ASSISTANT: 'assistant'
		}
	}
	
	async chat( messages ) {
		return new Promise( resolve => {
			this.openai.createChatCompletion( {
				    model: this.chatModel,
				    messages
			    } )
			    .then( response => {
				    if ( response.data && response.data.hasOwnProperty( 'choices' ) ) {
					    const responseContent = response.data.choices[ 0 ].message.content
					    resolve( formatResolve( {
						    status: true,
						    data: responseContent
					    } ) )
				    }
				    else {
					    resolve( formatResolve( {
						    status: false,
						    errorMessageResponse: `Нет ответа.`,
						    errorMessage: 'Нет ответа. Повтори еще раз.'
					    } ) )
				    }
			    } )
			    .catch( e => resolve( formatResolve( {
				    status: false,
				    errorMessageResponse: `Не удалось получить ответ: ${ e.message }`,
				    errorMessage: 'Не удалось получить ответ. Повтори еще раз.'
			    } ) ) )
		} )
	}
	
	async transcription( fileStream ) {
		return new Promise( resolve => {
			this.openai.createTranscription( fileStream, this.audioModel )
			    .then( response => {
				    if ( response.data.text ) {
					    resolve( formatResolve( {
						    status: true,
						    data: response.data.text
					    } ) )
				    }
				    else {
					    resolve( formatResolve( {
						    status: false,
						    errorMessageResponse: `Не удалось распознать сообщение.`,
						    errorMessage: 'Не удалось распознать сообщение. Повтори еще раз.'
					    } ) )
				    }
			    } )
			    .catch( e => resolve( formatResolve( {
				    status: false,
				    errorMessageResponse: `Ошибка в распознавании файла: ${ e.message }`,
				    errorMessage: 'Ошибка в распознавании файла. Повтори еще раз.'
			    } ) ) )
		} )
	}
}

export const OpenAIController = new OpenAIControllerClass( config.get( 'OPEN_AI_TOKEN' ) )