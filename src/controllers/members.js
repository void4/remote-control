module.exports.joinServer = async member => {
  const {
    updateMemberInvites,
    updateMemberStatus,
    getMember,
    createMember,
    updateMemberRoles
  } = require("../models/serverMembers");
  const { getRobotServer } = require("../models/robotServer");

  console.log("Joining Server");

  if (member.status && member.status.member)
    return { status: "Error!", error: "this user is already a emember" };

  const validate = await this.validateInvite({
    id: member.join,
    server_id: member.server_id
  });

  const join = member.join;
  let checkMembership = await getMember(member);
  if (!checkMembership) {
    checkMembership = await createMember(member);
  }
  if (validate && checkMembership) {
    member = checkMembership;
    member.status.member = true;
    let { roles, invites } = member;

    member = await updateMemberStatus(member);

    roles.push("member");
    roles = Array.from(new Set(roles)); //no dupes
    member.roles = roles;
    member = await updateMemberRoles(member);

    invites.push(join);
    invites = Array.from(new Set(invites)); //no dupes
    member.invites = invites;
    member = await updateMemberInvites(member);

    const robotServer = await getRobotServer(member.server_id);
    this.updateMemberCount(robotServer);

    return member;
  }
  return validate;
};

module.exports.leaveServer = async member => {
  const {
    getMember,
    updateMemberInvites,
    updateMemberStatus,
    updateMemberRoles
  } = require("../models/serverMembers");
  const { getRobotServer } = require("../models/robotServer");

  console.log("Leaving Server");
  member = await getMember(member);
  const robotServer = await getRobotServer(member.server_id);
  if (member.user_id === robotServer.owner_id) return member; //SERVER OWNERS CANNOT LEAVE THEIR OWN SERVER

  member.status.member = false;
  member = await updateMemberStatus(member);

  member.invites = [];
  member = await updateMemberInvites(member);

  member.roles = [];
  member = await updateMemberRoles(member);

  this.updateMemberCount(robotServer);

  return member;
};

const isOwner = member => {
  member.user_id;
};

module.exports.validateInvite = async invite => {
  console.log("Validating Invite", invite);
  const { getInvitesForServer } = require("../models/invites");
  const checkInvite = await getInvitesForServer(invite.server_id);
  let validate = false;
  checkInvite.map(inv => {
    if (inv.id === invite.id || inv.id === invite.join) {
      validate = true;
    }
  });
  return validate;
};

module.exports.getMemberCount = async server_id => {
  const { getMembers } = require("../models/serverMembers");
  const members = await getMembers(server_id);
  let count = 0;
  members.forEach(member => {
    if (member.status.member === true) count++;
  });
  return count;
};

module.exports.updateMemberCount = async robotServer => {
  const {
    updateRobotServerStatus,
    sendRobotServerStatus
  } = require("../models/robotServer");
  const { server_id } = robotServer;

  const updateMemberCount = await this.getMemberCount(server_id);

  robotServer.status.count = updateMemberCount;
  console.log("UPDATING ROBOT STATUS / COUNT: ", robotServer.status);
  const updateStatus = await updateRobotServerStatus(
    server_id,
    robotServer.status
  );

  if (updateStatus) {
    sendRobotServerStatus(server_id, robotServer.status);
  }
};
