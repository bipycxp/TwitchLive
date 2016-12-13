import 'whatwg-fetch'
import querystring from 'querystring'

import { twitch } from '../config'

const TWITCH_API_URL = twitch.apiUrl
const TWITCH_API_VERSION = twitch.apiVersion
const TWITCH_URL = twitch.url

const ELEMENTS_LIMIT_PER_REQ = 100
const DEFAULT_SEARCH_COUNT = 5

/**
 * Class to working with Twitch API.
 */
export class Twitch {
  /**
   * @param {String} clientId
   */
  constructor ({ clientId }) {
    this.clientId = clientId
  }

  /**
   * Get Twitch clientId.
   *
   * @return {String}
   */
  getClientId () {
    return this.clientId
  }

  /**
   * Send request to Twitch API and fetch response.
   *
   * @private
   * @param {String} path
   * @param {Object=} params
   * @return {Object}
   * @throws Error
   */
  async fetch (path, params = {}) {
    // Path to Twitch API with query params.
    const url = TWITCH_API_URL + path + '?' + querystring.stringify(params)
    const headers = {
      'Accept': `application/vnd.twitchtv.${TWITCH_API_VERSION}+json`,
      'Client-ID': this.clientId
    }

    const response = await fetch(url, { headers })

    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText)
    }

    return response.json()
  }

  /**
   * Map stream object.
   *
   * @private
   * @param {Object} stream Stream object from response.
   * @return {Object}
   */
  streamMap (stream) {
    return {
      delay: stream.delay,
      displayName: stream.channel.display_name,
      game: stream.game,
      gameUrl: TWITCH_URL + '/directory/game/' + stream.game,
      logo: stream.channel.logo,
      name: stream.channel.name,
      status: stream.channel.status,
      url: stream.channel.url,
      viewers: stream.viewers,
      datetime: {
        started: stream.created_at
      }
    }
  }

  /**
   * Get online streams from channels.
   *
   * @param {Array} channels
   * @param {Function|false|null} map Map function to mapping streams from response.
   *    If false - without mapping. If not a function - use Twitch.streamMap.
   * @return {Object}
   */
  async streams (channels, map = null) {
    let streams = []
    let params = {
      channel: channels.join(','),
      limit: ELEMENTS_LIMIT_PER_REQ,
      offset: 0
    }

    while (true) {
      let { _total, streams: respStreams } = await this.fetch('/streams', params)
      streams = [].concat(streams, respStreams)

      // Break loop if last response page.
      if (respStreams.length !== params.limit || streams.length === _total) break

      params.offset += params.limit
    }

    // If false - without mapping.
    if (map === false) return streams

    // If not a function - use Twitch.streamMap.
    const streamMap = map instanceof Function ? map : this.streamMap

    return streams.map(streamMap)
  }

  /**
   * Get channels by query.
   *
   * @param {String} query
   * @param {number} count
   * @param {Function|false|null} map
   * @return {Object[]}
   */
  async channels (query, count = DEFAULT_SEARCH_COUNT, map = null) {
    let channels = []
    let params = {
      query,
      limit: count < ELEMENTS_LIMIT_PER_REQ ? count : ELEMENTS_LIMIT_PER_REQ,
      offset: 0
    }

    while (true) {
      const { _total, channels: respChannels } = await this.fetch('/search/channels', params)
      channels = channels.concat(respChannels)

      // Break loop if last response page or count is reached.
      const channelsCount = channels.length
      if (respChannels.length !== params.limit || channelsCount === _total || channelsCount === count) break

      params.offset += params.limit
    }

    // If false - without mapping.
    if (map === false) return channels

    // If not a function - use Twitch.streamMap.
    return channels.map(map instanceof Function ? map : this.streamMap)
  }

  /**
   * Get channel info.
   *
   * @param {String} channel
   * @return {Object}
   */
  async channel (channel) {
    return this.fetch('/channels/' + channel)
  }

  /**
   * Get user follows.
   *
   * @param {String} user
   * @return {Object}
   */
  async follows (user) {
    let follows = []
    let params = {
      limit: ELEMENTS_LIMIT_PER_REQ,
      offset: 0
    }

    while (true) {
      let { _total, follows: respFollows } = await this.fetch(`/users/${user}/follows/channels`, params)
      follows = [].concat(follows, respFollows)

      // Break loop if last response page.
      if (respFollows.length !== params.limit || follows.length === _total) break

      params.offset += params.limit
    }

    return follows
  }
}

export default new Twitch({ clientId: twitch.clientId })
