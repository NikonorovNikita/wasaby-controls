/**
 * Created by rn.kondakov on 18.10.2018.
 */
define('Controls/Decorator/Markup/Converter', [
   'Controls/Decorator/Markup/resources/template',
   'Controls/Decorator/Markup/resources/linkDecorateConstants',
   'Core/core-merge'
], function(template,
   linkDecorateConstants,
   objectMerge) {
   'use strict';

   function isDecoratedLink(json) {
      return Array.isArray(json) && json[0] === 'span' &&
         json[1] && json[1].class === linkDecorateConstants.getClasses().wrap;
   }

   function undecorateLink(json) {
      var linkAttributes = json[2][1];
      linkAttributes.class = linkAttributes.class.replace(linkDecorateConstants.getClasses().link, 'asLink');
      return ['a', linkAttributes, linkAttributes.href];
   }

   function domToJson(dom) {
      if (dom.nodeType === 3) {
         // Text node.
         return dom.nodeValue;
      }

      // Tag name.
      var json = [dom.nodeName.toLowerCase()];

      if (dom.nodeType === 1 && dom.attributes.length > 0) {
         // Element node with attributes.
         json.push({});
         for (var j = 0; j < dom.attributes.length; ++j) {
            var attribute = dom.attributes.item(j);
            json[1][attribute.nodeName] = attribute.nodeValue;
         }
      }

      if (dom.hasChildNodes()) {
         for (var i = 0; i < dom.childNodes.length; ++i) {
            // Recursive converting of children.
            var item = domToJson(dom.childNodes.item(i));
            json.push(item);
         }
      }

      return isDecoratedLink(json) ? undecorateLink(json) : json;
   }

   var linkParseRegExp = /(?:(((?:https?|ftp|file|smb):\/\/|www\.)[^\s<>]+?)|([^\s<>]+@[^\s<>]+(?:\.[^\s<>]{2,6}?))|([^\s<>]*?))([.,:]?(?:\s|$|&nbsp;|(<[^>]*>)))/g,
      hasOpenATagRegExp = /<a(( )|(>))/i;

   // Wrap all links and email addresses placed not in tag a.
   function wrapUrl(html) {
      var inLink = false;
      return html.replace(linkParseRegExp, function(match, link, linkPrefix, email, text, end) {
         if (link && !inLink) {
            return '<a class="asLink" rel="noreferrer" href="' + (linkPrefix === 'www.' ? 'http://' : '') + link + '" target="_blank">' + link + '</a>' + end;
         }
         if (email && !inLink) {
            return '<a href="mailto:' + email + '">' + email + '</a>' + end;
         }
         if (end.match(hasOpenATagRegExp)) {
            inLink = true;
         } else if (~end.indexOf('</a>')) {
            inLink = false;
         }
         return match;
      });
   }

   /**
    * Convert html string to valid JsonML.
    * @function Controls/Decorator/Markup/Converter#htmlToJson
    * @param html {String}
    * @returns {Array}
    */
   var htmlToJson = function(html) {
      var div = document.createElement('div');
      div.innerHTML = wrapUrl(html).trim();
      return domToJson(div).slice(1);
   };

   /**
    * Convert Json to html string.
    * @function Controls/Decorator/Markup/Converter#jsonToHtml
    * @param json {Array} Json based on JsonML.
    * @param tagResolver {Function} exactly like in {@link Controls/Decorator/Markup#tagResolver}.
    * @param resolverParams {Object} exactly like in {@link Controls/Decorator/Markup#resolverParams}.
    * @returns {String}
    */
   var jsonToHtml = function(json, tagResolver, resolverParams) {
      return template({
         _options: {
            value: json,
            tagResolver: tagResolver,
            resolverParams: resolverParams
         }
      }, {});
   };

   /**
    * Convert Json array to its copy  by value in all nodes.
    * @function Controls/Decorator/Markup/Converter#deepCopyJson
    * @param json
    * @return {Array}
    */
   var deepCopyJson = function(json) {
      return objectMerge([], json, { clone: true });
   };

   /**
    * @class Controls/Decorator/Markup/Converter
    * @author Кондаков Р.Н.
    * @public
    */
   var MarkupConverter = {
      htmlToJson: htmlToJson,
      jsonToHtml: jsonToHtml,
      deepCopyJson: deepCopyJson
   };

   return MarkupConverter;
});
