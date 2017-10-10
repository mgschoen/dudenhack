const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = function (app) {

  /**
   * Returns all links to direct articles that are suggested in autocompletion
   * when a user enters a query in the search form on duden.de
   *
   * @param query: the string to search for
   */
  app.get('/dudendirect/:query', (req, res) => {
    const query = req.params.query;
    request('http://www.duden.de/search_duden/autocomplete/' + query, (err, httpResponse, body) => {
      if (err) throw err;
      var parsedData = (body !== '') ? JSON.parse(body) : {};
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

  /**
   * Returns all search results that are displayed on the first page
   * of a search request on duden.de
   *
   * @param query: the string to search for
   */
  app.get('/dudensearch/:query', (req, res) => {
    const query = req.params.query;
    request('http://www.duden.de/suchen/dudenonline/' + query, (err, httpResponse, body) => {
      const dom = new JSDOM(body);
      const document = dom.window.document;

      const entries = document.querySelectorAll('section.wide h2 a');

      var result = [];

      entries.forEach(entry => {
        result[result.length] = {
          key: entry.textContent,
          url: entry.getAttribute('href')
        }
      });

      res.send(result);
    });
  });
};
