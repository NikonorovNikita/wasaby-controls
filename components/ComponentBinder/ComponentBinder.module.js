define('js!SBIS3.CONTROLS.ComponentBinder',
    [
       'js!SBIS3.CONTROLS.HistoryController',
       'js!SBIS3.StickyHeaderManager',
       'js!SBIS3.CONTROLS.SearchController'
    ],
    function (HistoryController, StickyHeaderManager, SearchController) {
   /**
    * Контроллер для осуществления базового взаимодействия между компонентами.
    *
    * @class SBIS3.CONTROLS.ComponentBinder
    * @extends $ws.proto.Abstract
    * @author Крайнов Дмитрий Олегович
    * @public
    */
   /*методы для поиска*/

   function toggleCheckBoxes(operationPanel, gridView, hideCheckBoxes) {
      if (gridView._options.multiselect) {
         gridView._container.toggleClass('controls-ListView__showCheckBoxes', operationPanel.isVisible());
         if (hideCheckBoxes) {
            gridView._container.toggleClass('controls-ListView__hideCheckBoxes', !operationPanel.isVisible());
            gridView.removeItemsSelectionAll();
         }
         if (gridView._options.startScrollColumn !== undefined) {
            gridView.updateScrollAndColumns();
         }
      }
   }
   function drawItemsCallback(operationPanel, view) {
      //TODO: После перехода на экшены, кнопки ни чего знать о view не будут, и этот костыль уйдёт.
      $ws.helpers.forEach(operationPanel.getItemsInstances(), function(instance) {
         if ($ws.helpers.instanceOfModule(instance, 'SBIS3.CONTROLS.OperationsMark')) {
            instance.setLinkedView(view);
         } else {
            instance._options.linkedView = view;
         }
      }, this)
   }

   /**
    * Контроллер, позволяющий связывать компоненты осуществляя базовое взаимодейтсие между ними
    * @author Крайнов Дмитрий
    * @class SBIS3.CONTROLS.ComponentBinder
    * @extends $ws.proto.Abstract
    * @public
    */
   var ComponentBinder = $ws.proto.Abstract.extend(/**@lends SBIS3.CONTROLS.ComponentBinder.prototype*/{
      $protected : {
         _searchMode: false,
         _currentRoot: null,
         _pathDSRawData : [],
         _path: [],
         _scrollPages: [], // Набор страниц для скролл-пэйджина
         _pageOffset: 0, // offset последней страницы
         _currentScrollPage: 1,
         _options: {
            /**
             * @cfg {SBIS3.CONROLS.DataGridView} объект представления данных
             */
            view: undefined,
            /**
             * @cfg {SBIS3.CONROLS.BreadCrumbs} объект хлебных крошек
             */
            breadCrumbs: undefined,
            /**
             * @cfg {SBIS3.CONROLS.BackButton} объект кнопки назад
             */
            backButton: undefined,
            /**
             * @cfg {SBIS3.CONROLS.SearchForm} объект строки поиска
             */
            searchForm: undefined,
            /**
             * @cfg {SBIS3.CONROLS.OperationsPanel} объект панели массовых операций
             */
            operationPanel: undefined,
            /**
             * @cfg {SBIS3.CONROLS.FilterButton} объект кнопки фильтров
             */
            filterButton: undefined,
            /**
             * @cfg {SBIS3.CONROLS.Pagign} объект пэйджинга
             */
            paging: undefined
         }
      },

      /**
       * Установить отображение нового пути для хлебных крошек и кнопки назад
       * @param {Array} path новый путь, последний элемент попадает в BackButton, остальные в хлебные крошки
       */
      setPath: function(path){
         this._path = path;
         if (path.length){
            this._currentRoot = this._path.pop();
         } else {
            this._currentRoot = {};
         }
         this._options.breadCrumbs.setItems(this._path || []);
         this._options.backButton.setCaption(this._currentRoot.title || '');
      },

      getCurrentRootRecord: function(){
         return this._currentRoot ? this._currentRoot.data : null;
      },

      /**
       * Метод для связывания формы строки поиска с представлением данных.
       * для работы необходимо задать опциию view
       * @param {String} searchParamName параметр фильтрации для поиска
       * @param {String} searchCrumbsTpl шаблон отрисовки элемента пути в поиске
       * @param {SBIS3.CONROLS.SearchForm} [searchForm] объект формы поиска, если не передан используется тот, что задан в опциях
       * @param {String} [searchMode] В каком узле ищем, в текущем или в корне
       * @example
       * <pre>
       *     myBinder = new ComponentBinder({
       *        view: myGridView,
       *        searchForm: mySearchForm
       *     });
       *     myBinder.bindSearchGrid('СтрокаПоиска');
       * </pre>
       */
      bindSearchGrid : function(searchParamName, searchCrumbsTpl, searchForm, searchMode, doNotRespondOnReset) {
         this._searchController = new SearchController({
            view: this._options.view,
            searchForm: searchForm || this._options.searchForm,
            searchParamName: searchParamName,
            searchCrumbsTpl: searchCrumbsTpl,
            searchMode: searchMode,
            doNotRespondOnReset: doNotRespondOnReset
         });
         this._searchController.bindSearch();
      },
      bindSearchComposite: function(searchParamName, searchCrumbsTpl, searchForm) {
         this.bindSearchGrid.apply(this, arguments);
      },

      /**
       * Метод для связывания хлебных крошек с представлением данных
       * для работы необходимо задать опциию view
       * @param {SBIS3.CONROLS.BreadCrumbs} [breadCrumbs] объект хлебных крошек, если не передан используется тот, что задан в опциях
       * @param {SBIS3.CONROLS.BackButton} [backButton] объект книпоки назад, если не передан используется тот, что задан в опциях
       * @example
       * <pre>
       *     myBinder = new ComponentBinder({
       *        view: myGridView,
       *        breadCrumbs: myBreadCrumbs,
       *        backButton: myBackButton
       *     });
       *     myBinder.bindBreadCrumbs();
       * </pre>
       */
      bindBreadCrumbs: function(breadCrumbs, backButton){
         var self = this,
            view = this._options.view;

         backButton = backButton || this._options.backButton;
         breadCrumbs = breadCrumbs || this._options.breadCrumbs;

         function createBreadCrumb(data){
            var point = {};
            point[breadCrumbs._options.displayField] = data.title;
            point[breadCrumbs._options.keyField] = data.id;
            point[breadCrumbs._options.colorField] = data.color;
            point.data = data.data;
            return point;
         }

         function setPreviousRoot() {
            var previousRoot = self._path[self._path.length - 1];

            if(self._currentRoot !== null) {
               self._currentRoot = previousRoot;
               if (self._path.length) self._path.splice(self._path.length - 1);
               view.setCurrentRoot(previousRoot ? previousRoot[breadCrumbs._options.keyField] : null);
            }
            view.reload();
         }

         view.subscribe('onSetRoot', function(event, id, hier){
            //onSetRoot стреляет после того как перешли в режим поиска (так как он стреляет при каждом релоаде),
            //при этом не нужно пересчитывать хлебные крошки
            if (!self._searchMode){
               var i;
               /*
                TODO: Хак для того перерисовки хлебных крошек при переносе из папки в папку
                Проверить совпадение родительского id и текущего единственный способ понять,
                что в папку не провалились, а попали через перенос.
                От этого нужно избавиться как только будут новые датасорсы и не нужно будет считать пути для крошек
                */
               if (self._currentRoot && hier.length && hier[hier.length - 1].parent != self._currentRoot.id){
                  self._currentRoot = hier[0];
                  self._path = hier.reverse();
               } else {
                  /* Если root не установлен, и переданный id === null, то считаем, что мы в корне */
                  if ( (id === view._options.root) || (!view._options.root && id === null) ){
                      self._currentRoot = null;
                      self._path = [];
                  }
                  for (i = hier.length - 1; i >= 0; i--) {
                     var rec = hier[i];
                     if (rec){
                        var c = createBreadCrumb(rec);
                        if (self._currentRoot && !Object.isEmpty(self._currentRoot)) {
                           self._path.push(self._currentRoot);
                        } else {

                        }
                        self._currentRoot = c;
                     }
                  }
               }

               for (i = 0; i < self._path.length; i++){
                  if (self._path[i].id == id) {
                     self._path.splice(i, self._path.length - i);
                     break;
                  }
               }

               breadCrumbs.setItems(self._path);
               backButton.setCaption(self._currentRoot ? self._currentRoot.title : '');
            }
         });

         view.subscribe('onKeyPressed', function(event, jqEvent) {
            if(jqEvent.which === $ws._const.key.backspace) {
               setPreviousRoot();
               jqEvent.preventDefault();
            }
         });

         breadCrumbs.subscribe('onItemClick', function(event, id){
            self._currentRoot = this._dataSet.getRecordById(id);
            self._currentRoot = self._currentRoot ? self._currentRoot.getRawData() : null;
            if (id === null){
               self._path = [];
            }
            this.setItems(self._path);
            view.setCurrentRoot(id);
            view.reload();
            this._toggleHomeIcon(!self._path.length);
         });

         backButton.subscribe('onActivated', function(){
            setPreviousRoot();
         });
      },
      /**
       * Метод для связывания панели массовых оперций с представлением данных
       * для работы необходимо задать опциию view
       * @param {Boolean} hideCheckBoxes флаг, показывающий, скрывать checkBox'ы для отметки записей
       * @param {SBIS3.CONROLS.OperationsPanel} [operationPanel] объект панели массовых операций, если не передан используется тот, что задан в опциях
       * в представлении данных вместе с панелью или нет.
       * @example
       * <pre>
       *     myBinder = new ComponentBinder({
       *        view: myGridView,
       *        operationPanel: myOperationPanel
       *     });
       *     myBinder.bindOperationPanel(true);
       * </pre>
       */
      bindOperationPanel: function(hideCheckBoxes, operationPanel) {
         var view = this._options.view;
         operationPanel = operationPanel || this._options.operationPanel;
         operationPanel.subscribe('onDrawItems', function() {
            drawItemsCallback(operationPanel, view);
         });
         drawItemsCallback(operationPanel, view);
         toggleCheckBoxes(operationPanel, view, hideCheckBoxes);
         view.subscribe('onSelectedItemsChange', function(event, idArray) {
            if (idArray.length && !operationPanel.isVisible()) {
               operationPanel.show();
            }
            operationPanel.onSelectedItemsChange(idArray);
         });
         operationPanel.subscribe('onToggle', function() {
            toggleCheckBoxes(operationPanel, view, hideCheckBoxes);
         });
      },
      /**
       * Метод для связывания истории фильтров с представлением данных
       */
      bindFilterHistory: function(filterButton, fastDataFilter, searchParam, historyId, ignoreFiltersList, applyOnLoad, controller, browser) {
         var view = browser.getView(),
             noSaveFilters = ['Разворот', 'ВидДерева'],
             historyController, filter;

         if(searchParam) {
            noSaveFilters.push(searchParam);
         }

         if($ws.helpers.instanceOfMixin(view, 'SBIS3.CONTROLS.TreeMixin')) {
            noSaveFilters.push(view.getHierField());
         }

         if(ignoreFiltersList && ignoreFiltersList.length) {
            noSaveFilters = noSaveFilters.concat(ignoreFiltersList);
         }

         historyController = new controller({
            historyId: historyId,
            filterButton: filterButton,
            fastDataFilter: fastDataFilter,
            view: view,
            noSaveFilters: noSaveFilters
         });

         filterButton.setHistoryController(historyController);
         if(applyOnLoad) {
            filter = historyController.getActiveFilter();

            if(filter) {
               /* Надо вмерживать структуру, полученную из истории, т.к. мы не сохраняем в историю шаблоны строки фильтров */
               filterButton.setFilterStructure(historyController._prepareStructureElemForApply(filter.filter));
               /* Это синхронизирует фильтр и структуру, т.к. некоторые фильтры возможно мы не сохраняли,
                  и надо, чтобы это отразилось в структуре */
               view.setFilter(filter.viewFilter, true);
            }
         }
         setTimeout($ws.helpers.forAliveOnly(function() {
            // Через timeout, чтобы можно было подписаться на соыбтие, уйдёт с серверным рендерингом
            browser._notifyOnFiltersReady();
         }, view), 0);
      },

      bindPagingHistory: function(view, id) {
         var pagingHistoryController = new HistoryController({historyId: id}),
             historyLimit = pagingHistoryController.getHistory();

         if(historyLimit) {
            view.setPageSize(historyLimit, true);
         }

         view.subscribe('onPageSizeChange', function(event, pageSize) {
            pagingHistoryController.setHistory(pageSize, true);
         });
      },

      bindPaging: function(paging) {
         var view = this._options.view, self = this;
         this._paging = paging;
         paging.subscribe('onSelectedItemChange', function(e, key){
            var newPage, curPage;
            if (key > 0) {
               newPage = key - 1;
               curPage = view.getPage();
               if (curPage != newPage) {
                  view.setPage(newPage);
               }
            }
         });

         view.subscribe('onPageChange', function(e, page){
            var newKey, curKey;
            if (page >= 0) {
               newKey = page + 1;
               curKey = parseInt(self._paging.getSelectedKey(), 10);
               if (curKey != newKey) {
                  self._paging.setSelectedKey(newKey);
               }
            }
         });

         view.subscribe('onDataLoad', function(e, list) {
            if ((paging.getMode() == 'part')) {
               var meta = list.getMetaData && list.getMetaData().more;
               if  (meta && (paging.getSelectedKey() == paging.getItems().getCount()) && view._hasNextPage(meta)) {
                  paging.setPagesCount(paging.getPagesCount() + 1);
               }
            }
         })
      },

      _isTreeView: function(view){
         return $ws.helpers.instanceOfMixin(view, 'SBIS3.CONTROLS.TreeMixin');
      },

      bindScrollPaging: function(paging) {
         var view = this._options.view, self = this;
         paging = paging || this._options.paging;
         isTree = this._isTreeView(view);

         if (isTree){
            view.subscribe('onSetRoot', function(){
               var curRoot = view.getCurrentRoot();
               if (this._currentRoot !== curRoot){
                  this._options.paging.setPagesCount(0);
                  this._updateScrollPages(true);
                  this._currentRoot = curRoot;
               }
            }.bind(this));

            view.subscribe('onNodeExpand', function(){
               this._updateScrollPages(true);
            }.bind(this));
         }

         paging.subscribe('onSelectedItemChange', function(e, pageNumber){
            var scrollToPage = function(page){
               // Если первая страница - проскролим к самому верху, не считая оффсет
               var offset = page.offset ? this._offsetTop : 0;
               view._scrollWatcher.scrollTo(page.offset + offset);
            }.bind(this);
            if (pageNumber != this._currentScrollPage && this._scrollPages.length){
               var view = this._options.view,
                  page = this._scrollPages[pageNumber - 1];
                  if (page){
                     scrollToPage(page);
                  } else {
                     view.once('onDrawItems', function(){
                        this._updateScrollPages();
                        page = this._scrollPages[pageNumber - 1];
                        scrollToPage(page);
                     }.bind(this));
                     view._scrollLoadNextPage();
                  }
               this._currentScrollPage = pageNumber;
            }
         }.bind(this));

         view.subscribe('onScrollPageChange', function(e, page){
            var newKey, curKey,
               paging = this._options.paging;
            if (page >= 0 && paging.getItems()) {
               newKey = page + 1;
               curKey = parseInt(paging.getSelectedKey(), 10);
               if (curKey != newKey) {
                  if (newKey > paging.getItems().getCount()) {
                     paging.setPagesCount(newKey);
                  }
                  this._currentScrollPage = newKey;
                  paging.setSelectedKey(newKey);
               }
            }
         }.bind(this));

         $(window).on('resize.wsScrollPaging', this._resizeHandler.bind(this));
      },

      _isPageStartVisisble: function(page){
         return page.element.offset().top + page.element.outerHeight(true) >= 0
      },

      _resizeHandler: function(){
         var windowHeight = $(window).height();
         clearTimeout(this._windowResizeTimeout);
         if (this._windowHeight != windowHeight){
            this._windowHeight = windowHeight;
            this._windowResizeTimeout = setTimeout(function(){
               this._updateScrollPages(true);
            }.bind(this), 200);
         }
      },

      _getScrollPage: function(){
         var view = this._options.view;
         if (this._options.view.isScrollOnBottom(true)){
            return this._scrollPages.length - 1;
         }
         for (var i = 0; i < this._scrollPages.length; i++){
            var page = this._scrollPages[i];
            if (this._isPageStartVisisble(page)){
               return i;
            }
         }
      },

      _updateScrollPages: function(reset){
         var view = this._options.view;
         var viewportHeight = $(view._scrollWatcher.getScrollContainer()).height(),
            pageHeight = 0,
            lastPageStart = 0,
            self = this,
            listItems = $('> .controls-ListView__item', view._getItemsContainer()),
            stickyHeaderHeight = StickyHeaderManager.getStickyHeaderHeight(view.getContainer()) || 0;

            //Если элементов в верстке то нечего и считать
            if (!listItems.length){
               this._options.paging.setVisible(false);
               return;
            }

            // Нужно учитывать отступ от родителя, что бы правильно скроллить к странице
            if (!this._offsetTop){
               this._offsetTop = self._options.view._getItemsContainer().get(0).getBoundingClientRect().top; //itemsContainerTop - containerTop + self._options.view.getContainer().get(0).offsetTop;
            }
         //Сбрасываем все для пересчета
         if (reset){
            this._scrollPages = [];
            self._pageOffset = 0;
         }
         //Берем последнюю посчитаную страницу, если она есть
         if (this._scrollPages.length){
            lastPageStart = this._scrollPages[this._scrollPages.length - 1].element.index();
         } else {
            //Запушим первый элемент, если он есть
            var element = listItems.eq(0);
            if (view.getItems() && view.getItems().getCount() && element.length){
               this._scrollPages.push({
                  element: element,
                  offset: self._pageOffset
               })
            }
         }
         //Считаем оффсеты страниц начиная с последней (если ее нет - сначала)
         listItems.slice(lastPageStart ? lastPageStart + 1 : 0).each(function(){
            var $this = $(this),
               nextHeight = $this.next('.controls-ListView__item').outerHeight(true);
            pageHeight += $this.outerHeight(true);
            // Если набралось записей на выстору viewport'a добавим еще страницу
            // При этом нужно учесть отступ сверху от view и фиксированую шапку
            var offsetTop = self._scrollPages.length == 1 ? self._offsetTop : stickyHeaderHeight;
            if (pageHeight + nextHeight > viewportHeight - offsetTop) {
               self._pageOffset += pageHeight;
               self._scrollPages.push({
                  element: $this,
                  offset: self._pageOffset - stickyHeaderHeight
               });
               pageHeight = 0;
            }
         });

         var pagesCount = this._scrollPages.length;

         if (!this._options.view.getItems().getMetaData().more && pagesCount > 1){
            this._options.view.getContainer().css('padding-bottom', '32px');
         }
         if (this._options.paging.getSelectedKey() > pagesCount){
            this._options.paging._options.selectedKey = pagesCount;
         }
         this._options.paging.setPagesCount(pagesCount);

         //Если есть страницы - покажем paging
         this._options.paging.setVisible(pagesCount > 1);
      },

      destroy: function(){
         $(window).off('resize.wsScrollPaging');
         ComponentBinder.superclass.destroy.apply(this, arguments);
      }

   });

   return ComponentBinder;
});
