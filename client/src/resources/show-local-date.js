import moment from 'moment';

export class ShowLocalDateValueConverter {
  toView(value) {
    return moment(value).format('YYYY/MM/DD hh:mm:ss a');
  }
}
