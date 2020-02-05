//require dependencies
require('dotenv').config()
var express = require('express')
var cors = require('cors')
var request = require('request')

//require modules
var connection = require('./connection')

//assign environment variables
cicUser = process.env.cicUser
cicPassword = process.env.cicPassword
cicUrl = process.env.cicUrl
cicServer = process.env.cicServer
connectionType = process.env.connectionType
serverPort = process.env.serverPort

//assign global variables
var messageBody = null

//set up express
var app = express()
app.use(cors())
app.set('port', serverPort)

//connect to ICWS
function serverLogin(){
    
    console.log('Opening server connection')
    
    var loginOptions = connection.loginRequestOptions(cicUrl, cicServer, cicUser, cicPassword, connectionType)

    request(loginOptions, function(error, response, body){
        
        if(response ==  null){
            console.log('No response received from server')
            setTimeout(function(){
                serverLogin()
            }, 3000)
        }

        if (response.statusCode == 201){
            console.log('Success ICWS ' + response.statusCode)
            setConnectionInfo(loginOptions.url, response.headers)
        }
        
        else if(response.statusCode == 503){
            console.log(cicUrl + ' is not currently accepting connections. Server list:')
            console.log(response.body.alternateHostList)
            alternateServerLogin(response.body.alternateHostList)
            return
        
        }
        
    })
}

//connect to alternate server in switchover if necessary
function alternateServerLogin(serverList){

    var nextServer = serverList.shift()
    console.log('Attempting login to alternate server at ' + nextServer)

    var loginOptions = connection.loginRequestOptions(cicUrl, nextServer, cicUser, cicPassword, connectionType)

    request(loginOptions, function(error, response, body){

        if(response == null){
            logIntoAlternateServer(serverList)
            return
        }

        if(response.statusCode == 201){
            console.log('Success ICWS ' + response.statusCode)
            setConnectionInfo(loginOptions.url, response.headers)
        }
        else if(response.statusCode == 503){
            console.log(serverList + ' is not currently accepting connections.')
            alternateServerLogin(serverlist)
            return

        }
    })

}


//updates request headers with login information
function setConnectionInfo(fullServerUrl, headers){

    connection.connectionComplete(fullServerUrl, headers)
    console.log('Connection information updated')
    //start main app events
    mainCalls()

}

//main placeholder function
function mainCalls() {

    console.log('Template validated')

}

//app start
serverLogin()

//server functions
app.listen(app.get('port'), function(){
    console.log("Express server running at localhost:" + app.get('port'))
})

/* example server page for reference
app.get('/workgroups', function(request, response){
    response.send(watchedWorkgroupList);
})
*/