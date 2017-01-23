 var result = [],
     resultLimitPerPage = 300,
     $getDataButton = $('#get-data'),
     $downloadLink = $('#download-link'),
     accessTokenInput = $('#access-token'),
     pageIdInput = $('#page-id'),
     postIdInput = $('#post-id');

 $getDataButton.on('click', init);

 /**
  * AJAX request to Facebook Graph API requesting post comments.
  * If there are more than 300 comments (up to 900 works fine, 
  * you can change the value in resultLimitPerPage), the result will
  * be paged with an address for the next page contained
  * in result.paging.next as a link;  If the last page is 
  * returned, the result.paging.next is not presented.
  * A recursion is used with the same function, passing
  * the next page url as route;
  * @param route {string} - url for the FB graph api request
  */
 function getData(route) {

     $.getJSON(route, function(res) {
         var nextPage = res.paging.next;
         var data = res.data;

         for (var i = 0; i < data.length; i++) {
             result.push(data[i]);
         }

         if (nextPage) {
             getData(nextPage)
         } else {
             presentData(result);
             return;
         }
     });
 }

 /**
  * This is used to create a CSV string of each
  * entry and concatenate them in a result totaling
  * all entries in a CSV format ready to be exported;
  * @param data {string} - results from FB graph api;
  */
 function presentData(data) {
     var userId = '',
         userName = '',
         message = '',
         resultString = 'data:text/csv;charset=utf-8,';

     $.each(data, function(key, answer) {
         userId = answer.from.id;
         userName = answer.from.name;
         message = answer.message;

         resultString += userId + ',' + userName + ',' + message + '\n'
     });

     createCSVFile(resultString);
 };

 /**
  * This creates a download link for the CSV file.
  * The output name of the file is passed as 
  * value of the download attribute 
  * (post-reactions.csv in this case);
  * @param raw_input {string} - csv formatted string;
  */
 function createCSVFile(raw_input) {
     var encodedUri = encodeURI(raw_input);
     $downloadLink.attr({
         href: encodedUri,
         download: 'post-comments.csv'
     });
     $getDataButton.animate({ opacity: 1 });
     $downloadLink.animate({ opacity: 1 });
 }

 /**
  * This is where it all starts, if user has 
  * provided access token, page and  post id.
  * This function is attached to the get data button
  * click event;
  */
 function init() {
     $downloadLink.animate({ opacity: 0 });
     result = [];

     var postId = postIdInput.val();
     var pageId = pageIdInput.val();
     var accessToken = accessTokenInput.val();

     if (postId.length && accessToken.length && pageId.length) {
         var route = 'https://graph.facebook.com/v2.8/' + pageId + '_' + postId + '/comments/?limit=' + resultLimitPerPage + '&access_token=' + accessToken;
         getData(route);
         postIdInput.val('');
         pageIdInput.val('');
         accessTokenInput.val('');
         $getDataButton.animate({ opacity: 0 });
     }
 }