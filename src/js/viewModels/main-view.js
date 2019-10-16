define(['ojs/ojcore', 'jquery', 'knockout', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojmodel',
        'ojs/ojpagingtabledatasource', 'ojs/ojarraytabledatasource', 'ojs/ojcollectiontabledatasource'],
function(oj, $, ko, ArrayDataProvider) {

    function MainViewModel() {
        var self = this;

        self.esreviewData = ko.observable();
        self.pagingDatasource = ko.observable(new oj.PagingTableDataSource(new oj.ArrayTableDataSource([])));

        self.handleActivated = function(context) {
            self.buildCollection();
        };

        self.parseEsReviewResponse = function(response) {
            return {
                'EmployeeId': response['_source'].EmployeeId,
                'FirstName': response['_source'].FirstName,
                'LastName': response['_source'].LastName,
                'Email': response['_source'].Email,
                'JobId': response['_source'].JobId,
                'Salary': response['_source'].Salary,
                'Department': response['_source'].Department
            };
        };

        self.rootResponseParser = function(response) {
            return response.hits.hits;
        };

        self.esReviewColumns = [
            { headerText: 'First Name', field: 'FirstName' },
            { headerText: 'Last Name', field: 'LastName' },
            { headerText: 'Email', field: 'Email' },
            { headerText: 'Job', field: 'JobId' },
            { headerText: 'Salary', field: 'Salary' },
            { headerText: 'Department', field: 'Department' }
        ];

        self.getESReviewModel = function() {
            const ESReviewModel = oj.Model.extend({
                parse: self.parseEsReviewResponse,
                idAttribute: 'EmployeeId'
            });
            return new ESReviewModel();
        };

        self.getESReviewCollection = function() {
            const ESReviewCollection = oj.Collection.extend({
                fetchSize: 5,
                model: self.getESReviewModel(),
                parse: self.rootResponseParser
            });
            const returnCollection = new ESReviewCollection();
            returnCollection.customPagingOptions = function(response) {
                return {
                    totalResults: response.hits.total,
                    limit: response.hits.pageSize
                };
            };
            returnCollection.customURL = function(operation, collection, options) {
                const page = options.startIndex > 0 ? (options.startIndex / options.fetchSize) : 0;
                const requestBody = { page: page };
                return {
                    url: 'http://localhost:3000/api/customsearch',
                    type: 'POST',
                    contentType: 'application/json',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', 'Basic UFNDX1NVUEVSVVNFUjpXZWxjb21lMQ==');
                    },
                    data: JSON.stringify(requestBody)
                };
            };
            return returnCollection;
        }

        self.buildCollection = function() {
            self.esreviewData(self.getESReviewCollection());
            self.pagingDatasource(new oj.PagingTableDataSource(new oj.CollectionTableDataSource(self.esreviewData())));
        }
    }

    return new MainViewModel();

});