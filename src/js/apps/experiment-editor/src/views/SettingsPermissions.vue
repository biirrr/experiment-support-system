<template>
    <div class="settings-permissions">
        <ul class="no-bullet no-margin">
            <li v-for="permission in permissions" :key="permission.id" class="grid-x grid-padding-x">
                <div class="cell auto">
                    <h3 v-if="userForUserRef(permission.relationships.user.data)">{{ userForUserRef(permission.relationships.user.data).attributes.name }}</h3>
                    <div v-if="canModify(permission)">
                        <select v-model="permission.attributes.role" @change="modifyPermission(permission)">
                            <option value="owner">Owner</option>
                            <option value="author">Author</option>
                            <option value="tester">Tester</option>
                        </select>
                        <p v-if="permission.attributes.role === 'owner'" class="font-small">An owner can modify all aspects of the experiment.</p>
                        <p v-else-if="permission.attributes.role === 'author'" class="font-small">An author can edit the experiment, but cannot modify permissions.</p>
                        <p v-else-if="permission.attributes.role === 'tester'" class="font-small">A tester can only view the experiment.</p>
                    </div>
                    <p v-else class="font-small">This user owns this experiment. As there is only one owner, this cannot be changed.</p>
                </div>
                <div class="cell shrink">
                    <a v-if="canModify(permission)" aria-label="Delete this permission" @click="deletePermission(permission)">
                        <svg viewBox="0 0 24 24" class="mdi icon alert">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                    </a>
                    <svg v-else viewBox="0 0 24 24" class="mdi icon medium-gray" aria-label="This permission cannot be deleted">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </div>
            </li>
        </ul>
        <div>
            <div class="text-right">
                <button class="button primary hollow small" @click="toggleAddPermission"><template v-if="isAddingPermission">Don't add permission</template><template v-else>Add permission</template></button>
            </div>
            <div v-if="isAddingPermission" class="grid-x grid-padding-x">
                <div class="cell large-5">
                    <h3>Add a Permission</h3>
                    <form>
                        <label>Search
                            <input-field type="text" v-model="addUserSearch"/>
                        </label>
                        <ul class="no-bullet">
                            <li v-for="user in addUsers" :key="user.id">
                                <a @click="addPermission(user)">{{ user.attributes.name }}</a>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';

import { JSONAPIObject, Reference } from 'data-store';

import { StringKeyValueDict } from '@/interfaces';
import InputField from '@/components/InputField.vue';
import AriaMenubar from '@/components/AriaMenubar.vue';

@Component({
    components: {
        AriaMenubar,
        InputField,
    }
})
export default class SettingsPermissions extends Vue {
    public errors: StringKeyValueDict = {};
    public isAddingPermission = false;
    public addUserSearch = '';
    public addUsers = [];

    public get permissions(): JSONAPIObject[] {
        if (this.$store.state.dataStore.data['experiment-permissions']) {
            return Object.values(this.$store.state.dataStore.data['experiment-permissions']);
        } else {
            return [];
        }
    }

    public userForUserRef(userRef: Reference): JSONAPIObject | null {
        if (this.$store.state.dataStore.data.users && this.$store.state.dataStore.data.users[userRef.id]) {
            return this.$store.state.dataStore.data.users[userRef.id];
        } else {
            return null;
        }
    }

    public canModify(permission: JSONAPIObject): boolean {
        if (permission.attributes.role === 'owner') {
            return this.permissions.filter((permission: JSONAPIObject) => {
                return permission.attributes.role === 'owner';
            }).length > 1;
        } else {
            return true;
        }
    }

    @Watch('addUserSearch')
    public async userSearchChange(newValue: string): Promise<void> {
        if (newValue !== '') {
            const response = await axios.get(this.$store.state.config.dataStore.apiBaseUrl + '/users?filter[email]=' + newValue);
            this.addUsers = response.data.data.filter((user: JSONAPIObject) => {
                let found = false;
                this.permissions.forEach((permission) => {
                    if (user.id === (permission.relationships.user.data as Reference).id) {
                        found = true;
                    }
                });
                return !found;
            });
        }
    }

    public async deletePermission(permission: JSONAPIObject): Promise<void> {
        await this.$store.dispatch('deleteSingle', permission);
    }

    public toggleAddPermission(): void {
        this.isAddingPermission = !this.isAddingPermission;
    }

    public async addPermission(user: JSONAPIObject): Promise<void> {
        await this.$store.dispatch('createPermission', {
            type: 'experiment-permissions',
            attributes: {
                role: 'author',
            },
            relationships: {
                user: {
                    data: {
                        type: 'users',
                        id: user.id,
                    },
                },
                experiment: {
                    data: {
                        type: 'experiments',
                        id: this.$store.state.config.experiment.id,
                    },
                },
            },
        });
        this.isAddingPermission = false;
        this.addUserSearch = '';
    }

    public async modifyPermission(permission: JSONAPIObject): Promise<void> {
        await this.$store.dispatch('savePermission', permission);
    }
}
</script>
