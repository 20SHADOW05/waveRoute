// this file is not being used in this application/backend.

// incase the npm pacakage gets deprecated or if you just want to know how to use the api directly

// https://api.radio-browser.info/  --> radio-browser.info api docs

/* apart from using an npm package there are two ways to use it directly
    1. using DNS SRV records 
    2. using round-robin DNS hostname
*/

/* 1. using DNS SRV records 

    An SRV record tells you: which servers provide a service , on which protocol + port ,their priority / weight
    SRV record format: _service._protocol.domain
    So this record: _api._tcp.radio-browser.info
    Means: _api → service name , _tcp → protocol , radio-browser.info → domain

    this extracts the hostnames directly. we dont need to do any IP handling and reverse lookup. Some DNS servers don’t support reverse lookups. so this method is preferred.
    
*/

// script 1:

const dns = require('dns');
const util = require('util');
const resolveSrv = util.promisify(dns.resolveSrv);

/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
function get_radiobrowser_base_urls() {
    return resolveSrv("_api._tcp.radio-browser.info").then(hosts => {
        hosts.sort();
        return hosts.map(host => "https://" + host.name);
    });
}

/**
 * Get a random available radio-browser server.
 * Returns: string - base url for radio-browser api
 */
function get_radiobrowser_base_url_random() {
    return get_radiobrowser_base_urls().then(hosts => {
        var item = hosts[Math.floor(Math.random() * hosts.length)];
        return item;
    });
}

get_radiobrowser_base_urls().then(hosts => {
    console.log("All available urls")
    console.log("------------------")
    for (let host of hosts) {
        console.log(host);
    }
    console.log();

    return get_radiobrowser_base_url_random();
}).then(random_host => {
    console.log("Random base url")
    console.log("------------------")
    console.log(random_host);
});



/* 2. using round-robin DNS hostname

    A(address) record maps the IPv4 address of the hostname.
    all.api.radio-browser.info is a round robin DNS (a hostname with multiple A records) created by the radio-browser maintainers.
    it is meant to return all known API servers. after it returns all the IPs of radio-browser api servers,
    we do a dns reverse lookup to get their hostnames.

*/

// script 2:

const dns = require('dns');
const util = require('util');
const resolve4 = util.promisify(dns.resolve4);
const reverse = util.promisify(dns.reverse);

/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
function get_radiobrowser_base_urls() {
    return resolve4("all.api.radio-browser.info").then(hosts => {
        let jobs = hosts.map(host => reverse(host));
        return Promise.all(jobs);
    }).then(hosts => {
        hosts.sort();
        return hosts.map(host_arr => "https://" + host_arr[0]);
    });
}

/**
 * Get a random available radio-browser server.
 * Returns: string - base url for radio-browser api
 */
function get_radiobrowser_base_url_random() {
    return get_radiobrowser_base_urls().then(hosts => {
        var item = hosts[Math.floor(Math.random() * hosts.length)];
        return item;
    });
}

get_radiobrowser_base_urls().then(hosts => {
    console.log("All available urls")
    console.log("------------------")
    for (let host of hosts) {
        console.log(host);
    }
    console.log();

    return get_radiobrowser_base_url_random();
}).then(random_host => {
    console.log("Random base url")
    console.log("------------------")
    console.log(random_host);
});