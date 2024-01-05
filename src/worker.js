/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		let url = new URL(request.url);
		switch (url.pathname.substring(1)) {
			case 'locations':
				try {
					let query = url.searchParams.get('query') || '';
					if (query.length <= 8) {
						return new Response(JSON.stringify({ error: 'Please add your \'query\' parameter and make sure it\'s longer than 8 characters.' }, null,2));
					}

					const peticionBuscador = await fetch(`https://www.meteored.cl/peticionBuscador.php?lang=cl&texto=${query}`);
					let res = new Response(await peticionBuscador.text());
					res.headers.set("Cache-Control", "max-age=1800");
					return res
				} catch (e) {
					return new Response(JSON.stringify({ error: 'Internal error, please make sure all data is correct.' }, null,2));
				}
		  case 'weather':
					try {
						if(!url.searchParams.has('location_id')) {
							return new Response(JSON.stringify({ error: 'Please add your \'location_id\' parameter.' }, null,2));
						}
						
						const location_id = url.searchParams.get('location_id') ?? ''

						const weather = await fetch(`https://api.meteored.cl/index.php?api_lang=cl&localidad=${location_id}&v=3.0&affiliate_id=${env.METEORED_AFFILIATE_ID}`)

						let res = new Response(await weather.text());
						res.headers.set("Cache-Control", "max-age=1800");
						return res
					} catch (e) {
						return new Response(JSON.stringify({ error: 'Internal error, please make sure all data is correct.' }, null,2));
					}
			default:
				return new Response(JSON.stringify({
					base_uri: 'https://api-meteored.franciscosolis.cl',
					endpoints: [
						{
							path: '/locations',
							parameters: [
								{
									name: 'query',
									value: 'string',
									description: 'You should write here a location like your street, city and country to fetch all available locations'
								}
							],
						},
						{
							path: '/weather',
							parameters: [
								{
									name: 'location_id',
									value: 'int',
									description: 'This is the location id, you can get it using the /locations endpoint'
								}
							],
						}
					]
				}, null, 2));
		}
	}
};