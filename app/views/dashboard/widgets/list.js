import WidgetView from '../widget';
import Ember from 'ember';

export default WidgetView.extend({
  classNameBindings: [':list', 'isCollapsed:collapsed'],
  templateName: 'dashboard/widgets/list',

  hasMoreItems: Ember.computed.oneWay('controller.hasMoreItems'),
  isCollapsed: Ember.computed.oneWay('controller.isCollapsed'),
  paginationInfo: Ember.computed.oneWay('controller.paginationInfo'),

  title: Ember.computed('name', 'hasMoreItems', 'paginationInfo', function() {
    if (this.get('hasMoreItems')) {
      return `${this.get('name')} (${this.get('paginationInfo')})`;
    } else {
      return this.get('name');
    }
  })
});
