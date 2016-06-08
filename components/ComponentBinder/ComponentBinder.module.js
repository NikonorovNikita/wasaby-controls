define('js!SBIS3.CONTROLS.ComponentBinder', ['js!SBIS3.CONTROLS.Utils.KbLayoutRevertUtil', 'js!SBIS3.CONTROLS.HistoryController'], function (KbLayoutRevertUtil, HistoryController) {
   /**
    * Контроллер для осуществления базового взаимодействия между компонентами.
    *
    * @class SBIS3.CONTROLS.ComponentBinder
    * @extends $ws.proto.Abstract
    * @author Крайнов Дмитрий Олегович
    * @public
    */
   /*методы для поиска*/
   function startHierSearch(text, searchParamName, searchCrumbsTpl, searchMode, searchForm) {
      if (text) {
         var filter = $ws.core.merge(this._options.view.getFilter(), {
               'Разворот': 'С разворотом',
               'usePages': 'full'
            }),
            view = this._options.view,
            groupBy = view.getSearchGroupBy(searchParamName);
         if (searchCrumbsTpl) {
            groupBy.breadCrumbsTpl = searchCrumbsTpl;
         }
         filter[searchParamName] = text;
         view.setHighlightText(text, false);
         view.setHighlightEnabled(true);
         view.setInfiniteScroll(true, true);
         view.setGroupBy(groupBy);
         if (this._firstSearch) {
            this._lastRoot = view.getCurrentRoot();
            //Запомнили путь в хлебных крошках перед тем как их сбросить для режима поиска
            if (this._options.breadCrumbs && this._options.breadCrumbs.getItems()){
               this._pathDSRawData = $ws.core.clone(this._options.breadCrumbs.getItems().getRawData());
            }
         }
         this._firstSearch = false;
         //Флаг обозначает, что ввод был произведен пользователем
         this._searchReload = true;
         //Это нужно чтобы поиск был от корня, а крошки при этом отображаться не должны
         //Почему тут просто не скрыть их через css?
         if (this._options.breadCrumbs) {
            this._options.breadCrumbs.setItems([]);
         }
         //Скрываем кнопку назад, чтобы она не наслаивалась на колонки
         if (this._options.backButton) {
            this._options.backButton.getContainer().css({'visibility': 'hidden'});
         }

         if (searchMode == 'root'){
            filter[view.getHierField()] = undefined;
         }

         view.once('onDataLoad', function(event, data){
            var newText;

            toggleSearchKbLayoutRevert.call(this, view, false);
            /* Меняем раскладку, если требуется + меняем фильтр по которому искали */
            if(KbLayoutRevertUtil.needRevert(data)) {
               newText = KbLayoutRevertUtil.process(searchForm.getText());
               searchForm.setText(newText);
               view.setHighlightText(newText, false);
               view.getFilter()[searchParamName] = newText;
            }
            //setParentProperty и setRoot приводят к перерисовке а она должна происходить только при мерже
            this._options._itemsProjection.setEventRaising(false);
            //Сбрасываю именно через проекцию, т.к. view.setCurrentRoot приводит к отрисовке не пойми чего и пропадает крестик в строке поиска
            view._options._itemsProjection.setRoot(null);
            view._options._curRoot = null;
            this._options._itemsProjection.setEventRaising(true);
         });

         view.reload(filter, view.getSorting(), 0).addCallback(function(){
            view._container.addClass('controls-GridView__searchMode');
         });
         this._searchMode = true;
      }
   }

   function startSearch(text, searchParamName){
      if (text){
         var view = this._options.view,
            filter = $ws.core.merge(view.getFilter(), {
               'usePages': 'full'
            });
         filter[searchParamName] = text;
         view.setHighlightText(text, false);
         view.setHighlightEnabled(true);
         view.setInfiniteScroll(true, true);
         view.reload(filter, view.getSorting(), 0);
      }
   }

   function resetSearch(searchParamName){
      var
         view = this._options.view,
         filter = view.getFilter();
      delete (filter[searchParamName]);
      view.setHighlightText('', false);
      view.setHighlightEnabled(false);
      view.reload(filter, view.getSorting(), 0);
   }

   function resetGroup(searchParamName) {
      var
         view = this._options.view,
         filter = $ws.core.merge(view.getFilter(), {
            'Разворот' : 'Без разворота'
         }),
         self = this;
      delete (filter[searchParamName]);
      //При сбрасывании группировки в иерархии нужно снять класс-можификатор, но сделать это можно
      //только после релоада, иначе визуально будут прыжки и дерганья (класс меняет паддинги)
      view.once('onDataLoad', function(){
         view._container.removeClass('controls-GridView__searchMode');
         view._options._curRoot = self._lastRoot || null;
         view._getItemsProjection().setRoot(self._lastRoot || null);
      });
      this._searchMode = false;
      //Если мы ничего не искали, то и сбрасывать нечего
      if (this._firstSearch) {
         return;
      }
      view.setInfiniteScroll(this._isInfiniteScroll, true);
      view.setGroupBy(this._lastGroup);
      view.setHighlightText('', false);
      view.setHighlightEnabled(false);
      this._firstSearch = true;
      if (this._searchReload) {
         //Нужно поменять фильтр и загрузить нужный корень.
         //TODO менять фильтр в контексте, когда появятся data-binding'и
         filter[view.getHierField()] = this._lastRoot;
         //DataGridView._filter = filter;
         //DataGridView.setCurrentRoot(self._lastRoot); - плохо, потому что ВСЕ крошки на странице получат изменения
         //Релоад сделает то же самое, так как он стреляет onSetRoot даже если корень на самом деле не понменялся
         view.reload(filter, view.getSorting(), 0);
         // TODO: Нужно оставить одно поле хранящее путь, сейчас в одно запоминается состояние хлебных крошек
         // перед тем как их сбросить, а в другом весь путь вместе с кнопкой назад
         this._path = this._pathDSRawData || [];
         //Если сбросили поиск (по крестику) вернем путь в хлебные крошки и покажем кнопку назад
         if (this._options.breadCrumbs){
            this._options.breadCrumbs.getItems().setRawData(this._pathDSRawData);
            this._options.breadCrumbs._redraw();
         }
         if (this._options.backButton) {
            this._options.backButton.getContainer().css({'visibility': 'visible'});
         }
      } else {
         //Очищаем крошки. TODO переделать, когда появятся привзяки по контексту
         view.setFilter(filter, true);
      }
   }

   function breakSearch(searchForm, withReload){
      this._searchReload = !!withReload;
      this._firstSearch = !!withReload;
      //Если в строке поиска что-то есть, очистим и сбросим Фильтр
      if (searchForm.getText()) {
         searchForm.resetSearch();
      }
   }

   function toggleCheckBoxes(operationPanel, gridView, hideCheckBoxes) {
      if (gridView._options.multiselect && hideCheckBoxes) {
         gridView._container.toggleClass('controls-ListView__showCheckBoxes', operationPanel.isVisible())
            .toggleClass('controls-ListView__hideCheckBoxes', !operationPanel.isVisible());
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

   function toggleSearchKbLayoutRevert(view, needSet, searchParamName) {
      var filter = view.getFilter(),
          source;

      if(needSet) {
         if(!this._lastViewSource) {
            this._lastViewSource = view.getDataSource();
         }
         /* Подготовим фильтр и сорс для запроса со сменой раскладки */
         if(!this._searchSource) {
            this._searchSource = KbLayoutRevertUtil.prepareSearchSource(this._lastViewSource);
         }

         source = this._searchSource;
         filter = KbLayoutRevertUtil.prepareSearchFilter(this._lastViewSource, filter, searchParamName);


         view.setDataSource(source, true);
         view.setFilter(filter, true);
      } else {
         filter = KbLayoutRevertUtil.revertSearchFilter(filter);
         source = this._lastViewSource;

         view.setFilter(filter, true);
         if(source) {
            view.setDataSource(source, true);
            this._lastViewSource = null;
         }
      }
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
         _searchReload : true,
         _searchMode: false,
         _searchForm : undefined,
         _lastRoot : undefined,
         _lastGroup: {},
         _currentRoot: null,
         _pathDSRawData : [],
         _firstSearch: true,
         _lastViewMode: null,
         _lastViewSource: null,
         _searchSource: null,
         _path: [],
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
            filterButton: undefined
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
      bindSearchGrid : function(searchParamName, searchCrumbsTpl, searchForm, searchMode) {
         var self = this,
            view = this._options.view,
            isTree = $ws.helpers.instanceOfMixin(view, 'SBIS3.CONTROLS.TreeMixin');
         searchForm = searchForm || this._options.searchForm;
         //todo Проверка на "searchParamName" - костыль. Убрать, когда будет адекватная перерисовка записей (до 150 версии, апрель 2016)
         view._searchParamName = searchParamName;
         if (isTree){
            this._lastRoot = view.getCurrentRoot();
            view.subscribe('onBeforeSetRoot', function(ev, newRoot){
               self._lastRoot = newRoot;
               if (self._searchMode) {
                  breakSearch.call(self, searchForm, false);
               }
            });
            view.subscribe('onSetRoot', function(event, curRoot, hierarchy){
               //onSetRoot стреляет после того как перешли в режим поиска (так как он стреляет при каждом релоаде),
               //при этом не нужно запоминать текущий корень и делать видимым путь
               if (!self._searchMode){
                  self._lastRoot = curRoot;
                  //Запоминаем путь в хлебных крошках при смене корня
                  //Похоже на то, что его достаточно запоминать только непосредственно перед началом поиска
                  if (self._options.breadCrumbs && self._options.breadCrumbs.getItems()){
                     var crumbsItems = self._options.breadCrumbs.getItems();
                     self._pathDSRawData = $ws.core.clone(crumbsItems ? crumbsItems.getRawData() : []);
                  }
                  if (self._options.backButton) {
                     self._options.backButton.getContainer().css({'visibility': 'visible'});
                  }
               }
            });
            //Перед переключением в крошках в режиме поиска сбросим фильтр поиска
            view.subscribe('onSearchPathClick', function(ev, id){
               //Теперь весь функционал переключения находится здесь, из HierarchyDGView только оповещение о действии
               view.setCurrentRoot(id);
               view.reload();
            });
         }

         this._lastGroup = view._options.groupBy;
         this._isInfiniteScroll = view.isInfiniteScroll();

         searchForm.subscribe('onReset', function(event, text){
            toggleSearchKbLayoutRevert.call(self, view, false, searchParamName);
            if (isTree) {
               resetGroup.call(self, searchParamName);
            } else {
               resetSearch.call(self, searchParamName);
            }
         });

         searchForm.subscribe('onSearch', function(event, text) {
            toggleSearchKbLayoutRevert.call(self, view, true, searchParamName);
            if (isTree) {
               startHierSearch.call(self, text, searchParamName, undefined, searchMode, searchForm);
            } else {
               startSearch.call(self, text, searchParamName);
            }
         });

         searchForm.subscribe('onKeyPressed', function(eventObject, event){
            // переводим фокус на view и устанавливаем активным первый элемент, если поле пустое, либо курсор стоит в конце поля ввода
            if ((event.which == $ws._const.key.tab || event.which == $ws._const.key.down) && (this.getText() === '' || this.getText().length === this._inputField[0].selectionStart)){
               view.setSelectedIndex(0);
               view.setActive(true);
               event.stopPropagation();
            }
         });
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
                  if (id === view._options.root){
                      self._currentRoot = null;
                      self._path = [];
                  }
                  for (i = hier.length - 1; i >= 0; i--) {
                     var rec = hier[i];
                     if (rec){
                        var c = createBreadCrumb(rec);
                        if (self._currentRoot ) {
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
            self._currentRoot = this._dataSet.getRecordByKey(id);
            self._currentRoot = self._currentRoot ? self._currentRoot.getRaw() : null;
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
            operationPanel.onSelectedItemsChange(idArray);
         });
         operationPanel.subscribe('onToggle', function() {
            toggleCheckBoxes(operationPanel, view, hideCheckBoxes);
         });
      },
      /**
       * Метод для связывания истории фильтров с представлением данных
       */
      bindFilterHistory: function(filterButton, fastDataFilter, searchParam, historyId, ignoreFiltersList, controller, browser) {
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

         filter = historyController.getActiveFilter();

         filterButton.setHistoryController(historyController);
         /* Надо вмерживать структуру, полученную из истории, т.к. мы не сохраняем в историю шаблоны строки фильтров */
         filterButton.setFilterStructure(historyController._prepareStructureElemForApply(filter.filter));
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
      }
   });

   return ComponentBinder;
});
