import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import i18n from '../../../../../../i18n';
import { I18n } from 'react-i18next';
import styles from '../OrderInitial.scss';

class OrderInitial extends Component {
  triggerCopyTooltip() {
    $('#copy-to-clipboard').tooltip({
      trigger: 'click',
      placement: 'top',
    });

    $('#copy-to-clipboard')
      .tooltip('hide')
      .attr('data-original-title', i18n.t('order.copy'))
      .tooltip('show');

    setTimeout(() => {
      $('#copy-to-clipboard').tooltip('destroy');
    }, 1000);
  }

  getDepositAddressQr() {
    if(this.props.order.deposit_address && this.props.order.deposit_address.address) {
      return `https://chart.googleapis.com/chart?chs=250x250&chld=L|2&cht=qr&chl=
      ${this.props.order.deposit_address.address}`;
    }
  }

  getAddressIdType(){
    if(this.props.order.deposit_address) {
      return this.props.order.deposit_address.payment_id ? 'Payment Id'
        : this.props.order.deposit_address.destination_tag ? 'Destination Tag'
          : this.props.order.deposit_address.memo ? 'Memo': null;
    }
  }

  showAddressId(){
    return (
      <div>
        <br />
        {this.getAddressIdType()}
        <br />
        <b className={styles.address} style={{ wordWrap: 'break-word' }}>
        {this.props.order.deposit_address.payment_id}
        </b>
      </div>
    )
  }

  render() {
    return (
      <I18n ns="translations">
        {t => (
          <div className={styles.container}>
            <div className={styles['qr-container']}>
              <img className={styles.qr} src={this.getDepositAddressQr()} alt={t('order.qr')} />
            </div>

            <div className={styles.details}>
              { !this.props.isLimitOrder ?
              <h3>
                {t('order.initial1')}:{' '}
                <span className={styles.time}>
                  <b>{this.props.time}</b>
                </span>
              </h3> : null }

              <h4>
                {t('order.initial2')}{' '}
                <b>
                  {this.props.order.amount_quote} {this.props.order.pair.quote.code}
                </b>{' '}
                {t('order.initial3')}
                <br />
                <b className={styles.address} style={{ wordWrap: 'break-word' }}>
                  {this.props.order.deposit_address.address}
                </b>
                {this.getAddressIdType() ? this.showAddressId() : null}
              </h4>
              { this.props.order.deposit_address
                ? <CopyToClipboard text={this.props.order.deposit_address.address} onCopy={() => this.triggerCopyTooltip()}>
                    <button id="copy-to-clipboard" type="button" className="btn btn-default" data-test="copy-address">
                      {t('order.initial4')}
                    </button>
                  </CopyToClipboard>
                : null }
            </div>
          </div>
        )}
      </I18n>
    );
  }
}

export default OrderInitial;
