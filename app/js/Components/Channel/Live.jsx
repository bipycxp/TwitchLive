import React from 'react'
import Paper from 'material-ui/Paper'

import Channel from './Channel'
import Icon from '../Icon'

import classNames from 'classnames/bind'
import styles from './channel.scss'
const cx = classNames.bind(styles)

export default class LiveChannel extends React.Component {
  constructor (props) {
    super(props)

    this.handlePictureClick = this.handlePictureClick.bind(this)
  }

  handlePictureClick () {
    window.open(this.props.data.link, '_blank')
  }

  render () {
    let { data, favorite } = this.props
    let { game, link, liveTime, name, picture, status, viewers } = data

    return (
      <Channel className={cx('live')} favorite={favorite}>
        <Paper className={cx('picture')} rounded={false}>
          <img src={picture} onClick={this.handlePictureClick} />
        </Paper>
        <Paper className={cx('info')} rounded={false}>
          <div className={cx('viewers')}>
            {viewers}
            <Icon src={require('./Images/user.svg')} className={cx('icon', 'user')} />
          </div>
          <div className={cx('status')}>{status}</div>
          <div className={cx('live')}>live {liveTime}</div>
          <div className={cx('description')}>
            <a href={link} target="_blank">{name}</a>
            <span>{game}</span>
          </div>
        </Paper>
      </Channel>
    )
  }
}

LiveChannel.propTypes = {
  favorite: React.PropTypes.bool,
  data: React.PropTypes.shape({
    game: React.PropTypes.string.isRequired,
    link: React.PropTypes.string.isRequired,
    liveTime: React.PropTypes.number.isRequired,
    name: React.PropTypes.string.isRequired,
    picture: React.PropTypes.string.isRequired,
    status: React.PropTypes.string.isRequired,
    viewers: React.PropTypes.number.isRequired
  }).isRequired
}
