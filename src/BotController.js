import * as format from 'telegraf/format'
import { FileController } from './FileController.js'
import { OpenAIController } from './OpenAIController.js'

class BotControllerClass {
	
	constructor() {
	}
	
	getInitSession() {
		return {
			messages: []
		}
	}
	
	async init( ctx ) {
		ctx.session = this.getInitSession()
		await this.reply( ctx, 'Я могу ответить на голосовое или текстовое сообщение.', { active: true, format: format.bold } )
	}
	
	async reply( ctx, data = '', useFormat = {
		active: false,
		format: null
	} ) {
		if ( useFormat.active && typeof useFormat.format === 'function' ) {
			await ctx.reply( useFormat.format( data ) )
		}
		else {
			await ctx.reply( data )
		}
	}
	
	async getVoiceFileUrl( ctx ) {
		return new Promise( async ( resolve, reject ) => {
			try {
				const file_id = ctx.message.voice.file_id
				const link    = await ctx.telegram.getFileLink( file_id )
				resolve( link.href )
			}
			catch ( e ) {
				reject( false )
				console.log( 'Error while get voice file path', e.message )
			}
		} )
	}
	
	getUserId( ctx ) {
		return String( ctx.message.from.id )
	}
	
	async getAnswer( ctx, question ) {
		const userText = question
		await this.reply( ctx, `Твой запрос: ${ userText }`, { active: true, format: format.italic } )
		
		ctx.session.messages.push( { role: OpenAIController.roles.USER, content: userText } )
		
		const responseFromOpenAI = await OpenAIController.chat( ctx.session.messages )
		if ( !responseFromOpenAI.status ) {
			await this.reply( ctx, responseFromOpenAI.errorMessage, { active: true, format: format.code } )
			return
		}
		
		const responseText = responseFromOpenAI.data
		ctx.session.messages.push( { role: OpenAIController.roles.ASSISTANT, content: responseText } )
		await this.reply( ctx, `Ответ: ${ responseText }`, { active: true, format: format.bold } )
	}
	
	async onVoice( ctx ) {
		ctx.session ??= this.getInitSession()
		
		const fileUrl    = await this.getVoiceFileUrl( ctx )
		const userId     = this.getUserId( ctx )
		const downloaded = await FileController.download( fileUrl, userId )
		if ( !downloaded.status ) {
			await this.reply( ctx, downloaded.errorMessage, { active: true, format: format.code } )
			return
		}
		
		await this.reply( ctx, 'Голосовое принял.', { active: true, format: format.bold } )
		const oggPath   = downloaded.data
		const converted = await FileController.toMP3( oggPath, userId )
		if ( !converted.status ) {
			await this.reply( ctx, converted.errorMessage, { active: true, format: format.code } )
			return
		}
		
		await this.reply( ctx, 'Начал распознавание голосового.', { active: true, format: format.bold } )
		const mp3Path  = converted.data
		const streamed = await FileController.getFileStream( mp3Path )
		if ( !streamed.status ) {
			await this.reply( ctx, streamed.errorMessage, { active: true, format: format.code } )
			return
		}
		
		const mp3Stream     = streamed.data
		const transcription = await OpenAIController.transcription( mp3Stream )
		if ( !transcription.status ) {
			await this.reply( ctx, transcription.errorMessage, { active: true, format: format.code } )
			return
		}
		
		await this.getAnswer( ctx, transcription.data )
		
		await FileController.removeFile( oggPath )
		await FileController.removeFile( mp3Path )
	}
	
	async onText( ctx ) {
		ctx.session ??= this.getInitSession()
		
		await this.reply( ctx, 'Сообщение принял.', { active: true, format: format.bold } )
		const userText = ctx.message.text
		await this.getAnswer( ctx, userText )
	}
}

export const BotController = new BotControllerClass()