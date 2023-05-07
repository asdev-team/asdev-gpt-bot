import config from 'config'
import { session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { BotController } from './BotController.js'

const bot = new Telegraf( config.get( 'TELEGRAM_TOKEN' ) )

bot.use( session() )

bot.command( 'start', async ( ctx ) => {
	await BotController.init( ctx )
} )
bot.command( 'new', async ( ctx ) => {
	await BotController.init( ctx )
} )

bot.on( message( 'voice' ), async ( ctx ) => {
	await BotController.onVoice( ctx )
} )

bot.on( message( 'text' ), async ( ctx ) => {
	console.log( ctx.session )
	await BotController.onText( ctx )
} )

bot.launch()

process.once( 'SIGINT', () => bot.stop( 'SIGINT' ) )
process.once( 'SIGTERM', () => bot.stop( 'SIGTERM' ) )