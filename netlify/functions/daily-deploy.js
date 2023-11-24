import fetch from 'node-fetch'
import { schedule } from '@netlify/functions'

const BUILD_HOOK = 'https://api.netlify.com/build_hooks/655fef0fef3d105787c3b2e8'

const handler = schedule('0 9 * * *', async () => {
    await fetch (BUILD_HOOK, {
      method: 'POST'
    }).then(response => {
      console.log('Build hook response:', response)
    })
  
    return {
      statusCode: 200
    }
  })
  
  export { handler }