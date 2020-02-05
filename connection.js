//declaring globals for server parameters
var csrfToken = null
var setCookie = null
var sessionId = null
var fullServerUrl = null

//connection templates go here
module.exports = {

    loginRequestOptions: function(server, cic, username, password, connectionType){
        if(cic == ''){
            console.log('Connection Options\nServer Path: ' + server + '\nHostname not specified')
        }
        else{
        console.log('Connection Options\nServer Path: ' + server + '\nHostname: ' + cic)
        }

        var url = ''

        if(connectionType == 'local'){
            url = server + '/icws/connection'
        }
        else{
            url = server + '/' + cic +'/icws/connection'
        }
        console.log('Connecting to ICWS on: '+url)

        var options = {
            url: url,
            json: true,
            body: {
                '__type':'urn:inin.com:connection:icAuthConnectionRequestSettings',
                'applicationName' :'icwsConnector',
                'userID': username,
                'password' : password
            },
            method:'POST',
            headers: {
                'Accept-Language':'en-au'
            }
        }

    return options
    
    },

    connectionComplete: function(connectedServerUrl, connectionInformation){
        fullServerUrl = connectedServerUrl.replace('/icws/connection', '')
        setCookie = connectionInformation['set-cookie']
        sessionId = connectionInformation['inin-icws-sessionid']
        csrfToken = connectionInformation['inin-icws-csrf-token']
    },

    getRequestOptions: function(method, url, data){
        var options = {
            url: fullServerUrl + '/icws/' + sessionId + url,
            json: true,
            body: data,
            method: method,
            headers: {
                'Accept-Language':'en-au',
                'cookie':setCookie,
                'ININ-ICWS-CSRF-Token':csrfToken,
            }
        }
    return options;
    }

}