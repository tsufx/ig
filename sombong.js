'use strict'

/** UNFOLLOW ORANG SOMBONG **/
/** CODE BY TsuCode | Tsucode.net **/
/** TSUFX - OJEKONLEN **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');
const _ = require('lodash');
const inquirer = require('inquirer');

const User = [
	{
		type:'input',
		name:'username',
		message:'Insert Username'
	},
	{
		type:'password',
		name:'password',
		message:'Insert Password',
		mask:'*'
	},
	{
		type:'input',
		name:'sleep',
		message:'Insert Sleep (In MiliSeconds)',
		validate: function(value){
			value = value.match(/[0-9]/);
			if (value) return true;
			return 'Delay is number';
		}
	}
]

const Login = async function(User){

    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password)
        const account = await session.getAccount();
        return Promise.resolve({session,account});
    } catch (err) {
        return Promise.reject(err);
    }

}

const Followers = async function(session, id){
	const feed = new Client.Feed.AccountFollowers(session, id);
	try{
		const Pollowers = [];
		var cursor;
		do {
			if (cursor) feed.setCursor(cursor);
			const getPollowers = await feed.get();
			await Promise.all(getPollowers.map(async(akun) => {
				Pollowers.push(akun.id);
			}))
			cursor = await feed.getCursor();
		} while(feed.isMoreAvailable());
		return Promise.resolve(Pollowers);
	} catch(err){
		return Promise.reject(err);
	}
}

const Following = async function(session, id){
	const feed = new Client.Feed.AccountFollowing(session, id);
	try{
		const Pollowing = [];
		var cursor;
		do {
			if (cursor) feed.setCursor(cursor);
			const getPollowers = await feed.get();
			await Promise.all(getPollowers.map(async(akun) => {
				Pollowing.push(akun.id);
			}))
			cursor = await feed.getCursor();
		} while(feed.isMoreAvailable());
		return Promise.resolve(Pollowing);
	} catch(err){
		return Promise.reject(err);
	}
}

const Unfollow = async function(session, accountId){
	try {
		await Client.Relationship.destroy(session, accountId);
		return chalk`{bold.green Terlupakan}`;
	} catch (err){
		return chalk`{bold.red GAGAL}`;
	}
}

const Excute = async function(User,sleep){
	try {
		console.log(chalk`\n{yellow [?] Try to Login ....}`);
		const doLogin = await Login(User);
		console.log(chalk`{green | Login Successs .....}, {yellow Try to get Followers and Following ....}`);
		const task = [
			Followers(doLogin.session, doLogin.account.id),
			Following(doLogin.session, doLogin.account.id)
		]
		const [getFollowers, getFollowing] = await Promise.all(task);
		console.log(chalk`{blue  | Followers : ${getFollowers.length}\n | Following : ${getFollowing.length}}`);
		var AccountToUnfollow = [];
		await Promise.all(getFollowing.map(async(account) => {
			if (!getFollowers.includes(account)) {
				await AccountToUnfollow.push(account);
			}
		}));
		console.log(chalk`{blue  | Orang Sombong : ${AccountToUnfollow.length}}`)
		AccountToUnfollow = _.chunk(AccountToUnfollow, 10);
		for (let i = 0; i < AccountToUnfollow.length; i++) {
			await Promise.all(AccountToUnfollow[i].map(async(akun) => {
				const doUnfollow = await Unfollow(doLogin.session, akun);
				console.log(chalk`Unfollow {blue [${akun}]} => ${doUnfollow}`);				
			}))
			await console.log(chalk`{yellow [-] Delay For ${sleep} MiliSeconds}`);
			await delay(sleep);	
		}
	} catch(err) {
		console.log(err);
	}
}

console.log(chalk`
{bold Unfollow Orang Sombong Media}
{bold.blue TsuCode.net - Tsufx - OjekOnlen}
{bold.red TAUDIRI LAH PLER }
{bold.red Code By Tsufx}
`);

inquirer.prompt(User)
	.then(answers => {
		Excute({
			username:answers.username,
			password:answers.password
		},answers.sleep);
	})
