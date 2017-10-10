const http = require('http');

module.exports = function (app) {

  /**
   * Returns all links to direct articles that are suggested in autocompletion
   * when a user enters a query in the search form on duden.de
   *
   * @param query: the string to search for
   */
  app.get('/dudendirect/:query', (req, res) => {
    const query = req.params.query;
    res.setHeader('Content-Type', 'application/json');
    http.get('http://www.duden.de/search_duden/autocomplete/'+query, httpResponse => {
      var receivedData = '';
      httpResponse.on('data', chunk => {
        receivedData += chunk;
      });
      httpResponse.on('end', () => {
        var parsedData = (receivedData !== '') ? JSON.parse(receivedData) : {};
        var lexeme = parsedData.lexeme ? parsedData.lexeme.result : null;
        if (lexeme) {
          var filteredLexeme = lexeme.filter(entry => {
            if (entry.ignore)
              return false;
            return true;
          });
          var exposeUrls = filteredLexeme.map(entry => {
            return {
              'key': entry.key,
              'url': entry.label.split('href=\"')[1].split('\">')[0]
            };
          });
          res.send(JSON.stringify(exposeUrls));
        } else {
          res.send('[]');
        }
      });
    });
  });
};
