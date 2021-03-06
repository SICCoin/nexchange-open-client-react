import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { errorAlert, setWallet, selectCoin, fetchPrice } from 'Actions/index.js';
import validateWalletAddress from 'Utils/validateWalletAddress';
import styles from './WalletAddress.scss';
import AddressHistory from './AddressHistory/AddressHistory';
import { I18n } from 'react-i18next';
import i18n from '../../../../../i18n';

import urlParams from 'Utils/urlParams';


class WalletAddress extends Component {
  constructor(props) {
    super(props);

    this.state = { address: '', firstLoad: true , showHistory: false};
    this.fireOnBlur = true;
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setAddress = this.setAddress.bind(this);
    this.setCoin = this.setCoin.bind(this);
    this.dontFireOnBlur = this.dontFireOnBlur.bind(this);
  }

  validate = (address, receiveCoin) => {
    if (address === '' || !receiveCoin) {
      this.props.setWallet({
        address,
        valid: false,
      });

      return this.props.errorAlert({ show: false });
    }

    const valid = validateWalletAddress(
      address,
      receiveCoin,
      () =>
        this.props.errorAlert({
          show: true,
          message: `${address} ${i18n.t('error.novalid')} ${receiveCoin} ${i18n.t('generalterms.address')}.`,
        }),
      () => this.props.errorAlert({ show: false })
    );

    this.props.setWallet({
      address,
      valid,
    });
  };

  handleChange(event) {
    const address = event.target.value.replace(new RegExp(/ /g, 'g'), '');
    this.setState({ address });
    this.validate(address, this.props.selectedCoin[this.props.withdraw_coin]);
  }

  handleFocus(event) {
    this.setState({
      showHistory: true
    });
  }

  dontFireOnBlur() {
    this.fireOnBlur = false;
  }

  handleBlur(event) {
    if(this.fireOnBlur) {
      this.setState({
        showHistory: false
      });
    }
    this.fireOnBlur = true;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCoin[this.props.withdraw_coin] !== this.props.selectedCoin[this.props.withdraw_coin]) {
      this.validate(this.state.address, nextProps.selectedCoin[this.props.withdraw_coin]);
    }

    try {
      let orderHistory = localStorage['orderHistory']; 
      //Most recent order for each address
      this.orderHistory = orderHistory ? _.uniqBy(JSON.parse(orderHistory).reverse(), 'withdraw_address') : [];
      if(!_.isEmpty(nextProps.wallet.address)){
        this.orderHistory = _.filter(this.orderHistory, function(order) {
          return order.withdraw_address.startsWith(nextProps.wallet.address); 
        });
      }
    } catch (e) {
      this.orderHistory = [];
    }
  }

  componentDidUpdate(){
    //Check if withdraw_address url param exists. If exists, prefill address field with that value
    const params = urlParams();
    if (params && params.hasOwnProperty('withdraw_address') && !this.props.wallet.address
      && this.props.selectedCoin[this.props.withdraw_coin] && this.state.firstLoad) {
        const simulatedEvent ={target: {value: params['withdraw_address'].toString()}};
        this.handleChange(simulatedEvent);
        this.setState({firstLoad: false});
        this.props.button.focus();
      }
  }

  setAddress(address) {
    const simulatedEvent ={target: {value: address}};
    this.handleChange(simulatedEvent);
    this.props.button.focus();
  }

  setCoin(depositCoin, receiveCoin) {   
    if(!this.props.selectedCoin.selectedByUser &&
      depositCoin != this.props.selectedCoin.deposit &&
      receiveCoin != this.props.selectedCoin.receive) {
      //Select coin
      this.props.selectCoin({
        ...this.props.selectedCoin,
        deposit: depositCoin,
        receive: receiveCoin,
        selectedByUser: false
      }, this.props.pairs);

      //Update quote value
      const pair = `${receiveCoin}${depositCoin}`;
      const data = {
        pair,
        lastEdited: 'receive',
      };

      data['deposit'] = receiveCoin;
      data['receive'] = depositCoin;
      this.props.fetchPrice(data);
    }
  }

  render() {
    let coin = this.props.selectedCoin[this.props.withdraw_coin] ? this.props.selectedCoin[this.props.withdraw_coin] : '...';
    return (
      <I18n ns="translations">
        {t => (
          <div className="col-xs-12 active">
            <form className="form-group" onSubmit={this.handleSubmit}>
              <input
                type="text"
                ref={this.props.inputRef}
                className={`form-control ${styles.input}`}
                id="withdraw-addr"
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                value={this.state.address}
                autoComplete="off"
                placeholder={t('generalterms.youraddress', { selectedCoin: coin })}
              />
              {this.state.showHistory ?
                <AddressHistory 
                  history={this.orderHistory} 
                  setAddress={this.setAddress} 
                  setCoin={this.setCoin} 
                  dontFireOnBlur={this.dontFireOnBlur}
                  fireBlur={this.handleBlur}
                  />
                :  null}
            </form>
          </div>
        )}
      </I18n>
    );
  }
}

const mapStateToProps = ({ orderMode, selectedCoin, wallet, pairs }) => ({ orderMode, selectedCoin, wallet, pairs });
const mapDispatchToProps = dispatch => bindActionCreators({ errorAlert, setWallet, selectCoin, fetchPrice }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletAddress);
