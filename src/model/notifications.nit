# Copyright 2016 Alexandre Terrasa <alexandre@moz-code.org>.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

module notifications

import model::players

redef class AppConfig
	var notifications = new PlayerNotificationRepo(db.collection("notifications")) is lazy
end

redef class Player
	fun notifications(config: AppConfig): Array[PlayerNotification] do
		return config.notifications.find_by_player(self)
	end

	fun clear_notifications(config: AppConfig): Bool do
		return config.notifications.remove_by_player(self)
	end

	fun clear_notification(config: AppConfig, notification: PlayerNotification): Bool do
		if id != notification.player.id then return false
		return config.notifications.remove_by_id(notification.id)
	end
end

# Player representation
#
# Each player is linked to a Github user
class PlayerNotification
	serialize
	super Jsonable

	var id: String = (new MongoObjectId).id is serialize_as "_id"
	var timestamp: Int = get_time
	var player: Player
	var message: String

	redef fun to_s do return id
	redef fun ==(o) do return o isa SELF and id == o.id
	redef fun hash do return id.hash
	redef fun to_json do return serialize_to_json
end

class PlayerNotificationRepo
	super MongoRepository[PlayerNotification]

	fun find_by_player(player: Player): Array[PlayerNotification] do
		return find_all((new MongoMatch).eq("player._id", player.id))
	end

	fun remove_by_player(player: Player): Bool do
		return remove_all((new MongoMatch).eq("player._id", player.id))
	end
end
